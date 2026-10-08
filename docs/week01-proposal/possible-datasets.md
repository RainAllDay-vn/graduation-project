# Network Fault Datasets

## GNNet2021

- **Canonical source:** [Graph Neural Networking Challenge 2021 dataset](https://bnn.upc.edu/challenge/gnnet2021/dataset/). The page is visibly marked as modified 2022-01-12; the challenge is GNNet2021.
- **Purpose:** A simulated benchmark for scalable network digital twins and GNN generalization to larger networks. It is **simulated performance/topology**, not an incident or outage record.
- **Schema and data:** OMNeT++ packet-level simulations. Each sample combines a topology, routing configuration, and source-destination traffic matrix. Topologies are GML graphs; routing files list the nodes on each source-destination path. Raw sample bundles include `input_files.txt`, `traffic.txt`, `simulationResults.txt`, `stability.txt`, and `linkUsage.txt`. Measurements include global packets/loss/delay; per-path bandwidth, packet counts/loss, delay percentiles, and jitter; and per-port/queue utilization, loss, occupancy, and packet length.
- **Fault/performance coverage:** No labeled operational fault classes. It varies traffic, routing/path length, topology size, and link capacity. Training topologies contain 25–50 nodes; validation topologies contain 50–300 nodes, including subsets for longer paths, larger capacities, and both together. The primary challenge label is mean per-packet delay; jitter and packet loss are also provided.
- **Access/license:** Public download links for training, validation, test, and test-with-labels are on the canonical page. No dataset license is stated on that page; treat reuse terms as unverified.
- **Key limitations:** Synthetic simulator output; no real device alarms, syslog, reboot, outage, or incident timeline. It is primarily a performance/congestion and topology generalization benchmark, so it should not be treated as evidence of production fault behavior.

## Cisco IE Telemetry

- **Canonical source:** [Cisco IE Telemetry dataset repository](https://github.com/cisco-ie/telemetry). The repository describes itself as open-source network-anomaly datasets and references 2018 Big-DAMA and IEEE INFOCOM work; no separate dataset release date was verified.
- **Purpose:** Real-world network telemetry for supervised or unsupervised anomaly detection, with event occurrences that support detection, remediation, and behavior analysis.
- **Schema and data:** Each case provides a compressed CSV dataset, a header-definition file defining the columns, and a case file recording event information, event times, and initiating device(s). The repository also provides topology documentation: logical/actual topology maps, ECMP/speed context, device types, and CDP device-connection ground truth.
- **Fault coverage:** Baselines plus explicitly recorded operational events: **BGP clear, port flap, port admin shut, and transceiver removal/reinsertion**. The case table reports anomaly counts and durations for cases 2–10, including VIRL BGP-clear cases; baseline cases contain no anomalies. These are network-control-plane and port/device events, not ordinary performance congestion.
- **Access/license:** Public GitHub repository and downloadable case files. Licensed under the [Community Data License Agreement—Permissive 1.0](https://cdla.io/permissive-1-0/).
- **Key limitations:** Case data mixes testbed and VIRL scenarios, and traffic-load conditions vary by case. Exact feature names/types require reading each case’s separate header-definition artifact; raw compressed CSV contents were not normalized here. It is network telemetry rather than a general systems crash/reboot corpus.

## Why this pair is complementary

GNNet2021 supplies controlled, scalable **simulated topology and performance** variation with machine-readable path, queue, delay, and loss measurements. Cisco IE Telemetry supplies public, event-linked **operational network anomalies** with device/time context and topology ground truth, including BGP and physical/administrative port faults. Together they cover the controlled performance/topology side and the labeled operational fault side; neither replaces the other, and GNNet2021 should not be presented as a crash/outage dataset.

## GNNet/RouteNet lineage and recommendation

The verified challenge lineage is:

- **GNNet2020 — “Modeling QoS-aware queue scheduling policies at networks”** ([challenge](https://bnn.upc.edu/challenge/gnnet2020/), [dataset](https://bnn.upc.edu/challenge/gnnet2020/ch20-dataset/)): OMNeT++ samples with topology, routing, traffic, queue scheduling, and delay/jitter/loss measurements. It adds SP/WFQ/DRR and ToS-conditioned queue behavior.
- **GNNet2021 — “Creating a Scalable Network Digital Twin”** ([challenge](https://bnn.upc.edu/challenge/gnnet2021/), [datasets_v3](https://github.com/BNN-UPC/NetworkModelingDatasets/tree/master/datasets_v3)): OMNeT++ samples focused on generalization from 25–50-node training topologies to 51–300-node validation/test topologies, with routing, traffic, FIFO queue state, and performance labels.
- **GNNet2023 — “Creating a Network Digital Twin with Real Network Data”** ([challenge](https://bnn.upc.edu/challenge/gnnet2023/), [dataset](https://bnn.upc.edu/challenge/gnnet2023/dataset/), [challenge repository](https://github.com/BNN-UPC/GNNetworkingChallenge/tree/2023_RealNetworkDT)): real testbed samples with L2/L3 topology, routing, CBR or Multi-Burst flows, per-flow performance, and packet traces.

**Recommendation:** use GNNet2021/datasets_v3 as the baseline synthetic scalability benchmark; add GNNet2020 when queue-policy effects matter; use GNNet2023 for real-testbed and packet-trace validation. No canonical GNNet2022 dataset release was verified in this research; do not cite one without independently confirming a live official source.

### Compatible benchmark family (not GNNet challenge editions)

[**NetworkModelingDatasets**](https://github.com/BNN-UPC/NetworkModelingDatasets) is a separate BNN-UPC benchmark repository generated with BNNetSimulator. Its [datasets_v4](https://github.com/BNN-UPC/NetworkModelingDatasets/tree/master/datasets_v4), [datasets_v5](https://github.com/BNN-UPC/NetworkModelingDatasets/tree/master/datasets_v5), and [datasets_v6](https://github.com/BNN-UPC/NetworkModelingDatasets/tree/master/datasets_v6) families are compatible with RouteNet-style processing: GML topologies, destination-based routing, traffic descriptors, queue/scheduling state, and simulated delay/jitter/loss plus port/queue usage. v4 adds Topology Zoo, SNDlib traffic matrices, and MAWI-derived inter-arrival traces; v5 adds scheduling, scalability, and traffic-profile families; v6 adds fat-tree, mixed, and real-trace families. These are benchmark-family versions, **not GNNet challenge versions**. The repository pages do not state a dataset license; reuse terms remain unverified.

## What “GNNet” means for the 5G/Kubernetes question

**GNNet means Graph Neural Networking, not 5G.** GNNet2021 models generic Layer-3 network behavior: router/link topology, routing paths, source-destination traffic matrices, FIFO output-queue behavior, and simulated performance such as delay, jitter, loss, utilization, and occupancy. Its verified schema does not include 5G RAN or 5G core functions, Kubernetes objects, containers, cloud-native network functions (CNFs), network slices, or a cloud-native logical-service topology.

A 5G/Kubernetes digital twin therefore needs an explicit three-layer graph model:

1. **Physical/transport layer:** sites, links, routers, switches, interfaces, capacities, paths, and transport telemetry. GNNet can provide simulated transport-underlay performance data for this layer.
2. **Kubernetes/infrastructure layer:** clusters, nodes, racks/VMs, pods, services, deployments, CNFs, interfaces, and their placement/dependency relationships. GNNet does not provide these entities or relationships.
3. **5G logical-service layer:** RAN functions, 5G core functions, slices, flows/QoS policies, and service dependencies mapped onto the infrastructure and transport layers. GNNet does not provide these entities, slice context, or RAN/core telemetry.

GNNet’s limited role is consequently to supply transport-underlay topology/routing/traffic/performance examples (and, for GNNet2023, real testbed measurements) beneath a separately modeled Kubernetes and 5G service graph. It cannot by itself answer 5G service-, CNF-, slice-, or Kubernetes-level RCA questions.

## Relaxed 5G topology-and-incident requirement

Under the relaxed requirement—one fixed/static 5G topology plus logs or telemetry during incident scenarios, with topology assumed unchanged at the fault instance—no verified candidate provides a ready-made complete topology graph file.

- **5G Open RAN Multi-Modal IDD** is the closest match. Its documented testbed can be manually encoded once as a static graph: one O-CU, two O-DUs, one O-RU, two UEs, one O-Cloud/edge server, and one Near-RT RIC. It provides radio metrics (including RSRP, CQI, RSSI, SINR, MCS, and block-error measurements), O-CU PCAP captures and Zeek logs, and labeled attack scenarios (DoS/DDoS, probing, brute force, and web attacks). The topology graph itself is not released as a complete graph artifact.
- **NANCY/Italtel** is a supplement for UE–gNB–edge telemetry and captures. Its scenarios provide incident context at the scenario level, but the verified record does not establish normalized fault labels or a released complete topology graph.
- **NCSRD-DS-5GDDoS** does not meet this relaxed topology requirement: it supplies 5G radio/core metrics and malicious/benign DDoS context, but no complete topology graph file.
- **5GC PFCP Intrusion Detection Dataset** does not meet it either: it supplies emulated 5GC entity context, PCAPs, flow statistics, and PFCP attack labels, but no complete topology graph file.

The static-topology assumption is exact: for every incident snapshot, the topology graph, node identities, links, and service/dependency edges are treated as unchanged at the fault instance; only telemetry, logs, traces, and incident labels vary. The dataset namespace invariant is that one namespace identifies one immutable topology snapshot: every record in that namespace MUST resolve to the same topology identifier and graph, while any topology change MUST use a new namespace/version rather than mutate the existing one.