#!/usr/bin/env python3
"""Sinh devices.csv và links.csv cho topology mạng viễn thông cỡ một tỉnh."""

import csv
from collections import Counter
from pathlib import Path

OUT = Path(__file__).parent

# --- Cấu hình thiết bị theo nhóm: (role, số lượng, vendor, product_line, model) ---
# ports: danh sách cổng theo thứ tự ưu tiên cấp phát, đủ dùng cho bậc tối đa của nhóm
def _card_ports(prefix, n_cards, per_card):
    return [f"{prefix}{c}/{p}" for c in range(n_cards) for p in range(per_card)]


GROUPS = {
    "core": dict(count=4, vendor="Cisco", line="ASR 9900", model="ASR-9922",
                 ports=_card_ports("0/", 6, 4)),
    "edge_aggregation": dict(count=24, vendor="Cisco", line="NCS 5500", model="NCS-5508",
                             ports=_card_ports("0/", 4, 4)),
    "exchange": dict(count=36, vendor="Huawei", line="S9700", model="S9704",
                     ports=["100GE1/0/%d" % i for i in range(1, 17)]
                          + ["100GE2/0/%d" % i for i in range(1, 9)]),
    "access": dict(count=480, vendor="Cisco", line="Catalyst 9300", model="C9300-48P",
                   ports=["Te1/1/1", "Te1/1/2", "Te1/1/3", "Te1/1/4"]),
    "national_border": dict(count=8, vendor="Cisco", line="ASR 9000", model="ASR-9006",
                            ports=_card_ports("0/", 4, 4)),
    "peering": dict(count=6, vendor="Nokia", line="7750 SR", model="SR-1x",
                    ports=["c1/1/%d/1" % i for i in range(1, 9)]),
}

PREFIX = {
    "core": "CORE",
    "edge_aggregation": "AGG",
    "exchange": "EXCH",
    "access": "ACC",
    "national_border": "IGW",
    "peering": "PEER",
}

# Phân bố site: access trải theo mật độ dân 7 đơn vị hành chính
ACCESS_SITES = ["SITE-1"] * 144 + ["SITE-2"] * 120 + ["SITE-3"] * 96 + \
               ["SITE-4"] * 58 + ["SITE-5"] * 33 + ["SITE-6"] * 19 + ["SITE-7"] * 10

# 12 tổng đài lõi gán nhiều access hơn: 12*14 + 24*13 = 480
ACCESS_PER_EXCHANGE = [14] * 12 + [13] * 24

devices = []
ids = {}
for role, g in GROUPS.items():
    pre, n = PREFIX[role], g["count"]
    ids[role] = [f"{pre}-{i + 1:02d}" if role != "access" else f"{pre}-{i + 1:03d}"
                 for i in range(n)]

for role, g in GROUPS.items():
    for i, dev_id in enumerate(ids[role]):
        if role == "access":
            site = ACCESS_SITES[i]
        elif role in ("core", "national_border"):
            site = "SITE-1" if i < g["count"] // 2 else "SITE-2"
        elif role == "peering":
            site = f"SITE-{i // 2 + 1}"
        else:  # edge_aggregation, exchange
            site = f"SITE-{i // (g['count'] // 4) + 1}"
        devices.append([dev_id, role, site, g["vendor"], g["line"], g["model"]])

with open(OUT / "devices.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["device_id", "device_role", "site", "vendor", "product_line", "model"])
    w.writerows(devices)

# --- Sinh liên kết ---
links = []
seq = [0]
used = {d[0]: 0 for d in devices}
cfg = {role: GROUPS[role] for role in GROUPS}


def take(dev_id):
    """Cấp một cổng chưa dùng của thiết bị, theo đúng mẫu cổng của nhóm."""
    role = ROLE_OF[dev_id]
    g = cfg[role]
    i = used[dev_id]
    used[dev_id] += 1
    assert i < len(g["ports"]), f"{dev_id} hết cổng"
    return g["ports"][i]


ROLE_OF = {d[0]: d[1] for d in devices}


def add(a, b, medium, capacity):
    seq[0] += 1
    links.append([f"LNK-{seq[0]:04d}", a, take(a), b, take(b), medium, capacity])


# 1) core <-> edge_aggregation : mỗi AGG nối 2 core (ECMP dự phòng)
for k, agg in enumerate(ids["edge_aggregation"]):
    for off in (0, 1):
        add(ids["core"][(k + off) % 4], agg, "optical", 100000)

# 2) edge_aggregation <-> exchange : mỗi EXCH nối 2 AGG
for k, exch in enumerate(ids["exchange"]):
    for off in (0, 1):
        add(ids["edge_aggregation"][(2 * k + off) % 24], exch, "optical", 100000)

# 3) exchange <-> access : 1 uplink mỗi access, mỗi EXCH gán 13 hoặc 14 access
acc = 0
for k, exch in enumerate(ids["exchange"]):
    for _ in range(ACCESS_PER_EXCHANGE[k]):
        add(exch, ids["access"][acc], "optical", 10000)
        acc += 1

# 4) access <-> national_border : 8 access tại điểm biên, mỗi cầu 1 IGW
for k, dev_id in enumerate(ids["access"][:8]):
    add(dev_id, ids["national_border"][k], "optical", 10000)

# 5) national_border <-> peering : mỗi IGW nối 3/6 thiết bị peering (đường dự phòng)
#    xoay theo k*3 để mỗi thiết bị peering nhận đúng 4 đường từ 8 IGW
for k, igw in enumerate(ids["national_border"]):
    for off in range(3):
        add(igw, ids["peering"][(k * 3 + off) % 6], "optical", 100000)

with open(OUT / "links.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["link_id", "a_device_id", "a_port", "b_device_id", "b_port",
                "medium", "capacity_mbps"])
    w.writerows(links)

# --- Kiểm tra ---
print(f"devices: {len(devices)}")
for role, g in GROUPS.items():
    print(f"  {role:18} {g['count']:4}  ({g['vendor']} {g['model']})")
print(f"links:   {len(links)}")
known = set(ROLE_OF)
assert all(r[1] in known and r[3] in known for r in links), "link trỏ tới thiết bị không tồn tại"
assert all(r[2] and r[4] for r in links), "thiếu thông tin cổng"
ports = [(r[1], r[2]) for r in links] + [(r[3], r[4]) for r in links]
assert len(ports) == len(set(ports)), "trùng cổng trên cùng thiết bị"
assert len({r[0] for r in links}) == len(links), "trùng link_id"
deg = {}
for r in links:
    deg[r[1]] = deg.get(r[1], 0) + 1
    deg[r[3]] = deg.get(r[3], 0) + 1
print(f"bậc TB:   {sum(deg.values()) / len(devices):.2f}   max: {max(deg.values())}")
assert all(d in deg for d in ROLE_OF), "có thiết bị không nối liên kết nào"
spread = {}
for dev_id, role in ROLE_OF.items():
    spread.setdefault(role, Counter()).update([deg[dev_id]])
for role, c in spread.items():
    print(f"  bậc {role:18} {dict(sorted(c.items()))}")
print("OK: khóa ngoại, cổng, link_id, không thiết bị cô lập")
