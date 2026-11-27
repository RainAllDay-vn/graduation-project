package com.gr2.noc.config;

import com.gr2.noc.service.enums.ServiceStatus;
import com.gr2.noc.service.enums.ServiceType;
import com.gr2.noc.service.model.NetworkService;
import com.gr2.noc.service.repository.NetworkServiceRepository;
import com.gr2.noc.topology.enums.DeviceLayer;
import com.gr2.noc.topology.model.NetworkDevice;
import com.gr2.noc.topology.model.NetworkLink;
import com.gr2.noc.topology.repository.NetworkDeviceRepository;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Queue;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

/**
 * Explicit in-memory repository doubles for integration tests.
 *
 * Production code depends strictly on the Neo4j repositories — there is no
 * in-memory fallback in the services. These doubles replace the real
 * repositories in tests that exclude the Neo4j stack (fast, hermetic), and
 * keep the same read/write semantics as the real ones.
 *
 * Activate the "real-neo4j" profile (see TopologyNeo4jPersistenceIntegrationTest)
 * to disable these doubles and run against a real Neo4j via Testcontainers.
 */
@Configuration
@Profile("!real-neo4j")
public class InMemoryRepositoryTestConfig {

    @Bean
    public NetworkDeviceRepository networkDeviceRepository() {
        return new InMemoryNetworkDeviceRepository();
    }

    @Bean
    public NetworkServiceRepository networkServiceRepository() {
        return new InMemoryNetworkServiceRepository();
    }

    abstract static class InMemoryRepositoryBase<T, ID> {

        protected final Map<ID, T> store = new ConcurrentHashMap<>();

        protected abstract ID idOf(T entity);

        protected <S extends T> S put(S entity) {
            store.put(idOf(entity), entity);
            return entity;
        }

        @SuppressWarnings({"rawtypes"})
        protected List<T> sorted(List<T> items, Sort sort) {
            if (sort == null || sort.isUnsorted()) {
                return items;
            }
            Comparator<T> comparator = null;
            for (Sort.Order order : sort) {
                Comparator<T> c = Comparator.comparing(
                        item -> (Comparable) property(item, order.getProperty()),
                        Comparator.nullsLast(Comparator.naturalOrder()));
                if (order.isDescending()) {
                    c = c.reversed();
                }
                comparator = comparator == null ? c : comparator.thenComparing(c);
            }
            List<T> copy = new ArrayList<>(items);
            copy.sort(comparator);
            return copy;
        }

        private static Object property(Object bean, String name) {
            BeanWrapper wrapper = new BeanWrapperImpl(bean);
            return wrapper.isReadableProperty(name) ? wrapper.getPropertyValue(name) : null;
        }

        protected Page<T> paged(List<T> items, Pageable pageable) {
            Sort sort = pageable == null ? Sort.unsorted() : pageable.getSort();
            List<T> content = sorted(items, sort);
            if (pageable == null || pageable.isUnpaged()) {
                return new PageImpl<>(content, Pageable.unpaged(), content.size());
            }
            int offset = (int) pageable.getOffset();
            int end = Math.min(offset + pageable.getPageSize(), content.size());
            List<T> pageContent = offset <= content.size() ? content.subList(offset, end) : List.of();
            return new PageImpl<>(pageContent, pageable, content.size());
        }

        protected RuntimeException unsupportedExampleQuery() {
            return new UnsupportedOperationException(
                    "Example queries are not supported by the in-memory test repository");
        }
    }

    static class InMemoryNetworkDeviceRepository extends InMemoryRepositoryBase<NetworkDevice, String>
            implements NetworkDeviceRepository {

        @Override
        protected String idOf(NetworkDevice device) {
            return device.getId();
        }

        @Override
        public <S extends NetworkDevice> S save(S device) {
            return put(device);
        }

        @Override
        public <S extends NetworkDevice> List<S> saveAll(Iterable<S> entities) {
            List<S> saved = new ArrayList<>();
            entities.forEach(e -> saved.add(save(e)));
            return saved;
        }

        @Override
        public Optional<NetworkDevice> findById(String id) {
            return Optional.ofNullable(store.get(id));
        }

        @Override
        public boolean existsById(String id) {
            return id != null && store.containsKey(id);
        }

        @Override
        public List<NetworkDevice> findAll() {
            return new ArrayList<>(store.values());
        }

        @Override
        public List<NetworkDevice> findAll(Sort sort) {
            return sorted(findAll(), sort);
        }

        @Override
        public Page<NetworkDevice> findAll(Pageable pageable) {
            return paged(findAll(), pageable);
        }

        @Override
        public List<NetworkDevice> findAllById(Iterable<String> ids) {
            List<NetworkDevice> result = new ArrayList<>();
            for (String id : ids) {
                NetworkDevice device = store.get(id);
                if (device != null) {
                    result.add(device);
                }
            }
            return result;
        }

        @Override
        public long count() {
            return store.size();
        }

        @Override
        public void deleteById(String id) {
            store.remove(id);
            detachIncomingLinks(id);
        }

        @Override
        public void delete(NetworkDevice entity) {
            String id = idOf(entity);
            store.remove(id);
            detachIncomingLinks(id);
        }

        @Override
        public void deleteAllById(Iterable<? extends String> ids) {
            ids.forEach(this::deleteById);
        }

        private void detachIncomingLinks(String targetId) {
            if (targetId == null) {
                return;
            }
            for (NetworkDevice device : store.values()) {
                if (device.getLinks() != null) {
                    device.getLinks().removeIf(link ->
                            link.getTargetDevice() != null && targetId.equals(link.getTargetDevice().getId()));
                }
            }
        }

        @Override
        public void deleteAll(Iterable<? extends NetworkDevice> entities) {
            for (NetworkDevice entity : entities) {
                store.remove(idOf(entity));
            }
        }

        @Override
        public void deleteAll() {
            store.clear();
        }

        @Override
        public <S extends NetworkDevice> Optional<S> findOne(Example<S> example) {
            throw unsupportedExampleQuery();
        }

        @Override
        public <S extends NetworkDevice> List<S> findAll(Example<S> example) {
            throw unsupportedExampleQuery();
        }

        @Override
        public <S extends NetworkDevice> List<S> findAll(Example<S> example, Sort sort) {
            throw unsupportedExampleQuery();
        }

        @Override
        public <S extends NetworkDevice> Page<S> findAll(Example<S> example, Pageable pageable) {
            throw unsupportedExampleQuery();
        }

        @Override
        public <S extends NetworkDevice, R> R findBy(Example<S> example,
                Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) {
            throw unsupportedExampleQuery();
        }

        @Override
        public <S extends NetworkDevice> long count(Example<S> example) {
            throw unsupportedExampleQuery();
        }

        @Override
        public <S extends NetworkDevice> boolean exists(Example<S> example) {
            throw unsupportedExampleQuery();
        }

        @Override
        public List<NetworkDevice> findByLayer(DeviceLayer layer) {
            return store.values().stream()
                    .filter(d -> d.getLayer() == layer)
                    .toList();
        }

        @Override
        public List<NetworkDevice> findByRegion(String region) {
            return store.values().stream()
                    .filter(d -> Objects.equals(d.getRegion(), region))
                    .toList();
        }

        @Override
        public List<NetworkDevice> findByLayerAndRegion(DeviceLayer layer, String region) {
            return store.values().stream()
                    .filter(d -> d.getLayer() == layer && Objects.equals(d.getRegion(), region))
                    .toList();
        }

        @Override
        public List<NetworkDevice> findAllWithLinks() {
            return findAll();
        }

        @Override
        public Optional<NetworkDevice> findByIdWithLinks(String deviceId) {
            return findById(deviceId);
        }

        @Override
        public List<NetworkDevice> findSourcesByLinkId(String linkId) {
            if (linkId == null) {
                return List.of();
            }
            return store.values().stream()
                    .filter(d -> d.getLinks() != null && d.getLinks().stream()
                            .anyMatch(l -> linkId.equals(l.getLinkId())))
                    .toList();
        }

        @Override
        public List<NetworkDevice> find1HopNeighborhood(String deviceId) {
            return neighborhood(deviceId, 1);
        }

        @Override
        public List<NetworkDevice> find2HopNeighborhood(String deviceId) {
            return neighborhood(deviceId, 2);
        }

        private List<NetworkDevice> neighborhood(String deviceId, int maxHops) {
            if (!store.containsKey(deviceId)) {
                return List.of();
            }
            Set<String> visited = new LinkedHashSet<>();
            Queue<String> queue = new LinkedList<>();
            Map<String, Integer> distance = new HashMap<>();
            visited.add(deviceId);
            distance.put(deviceId, 0);
            queue.add(deviceId);
            while (!queue.isEmpty()) {
                String current = queue.poll();
                int dist = distance.get(current);
                if (dist >= maxHops) {
                    continue;
                }
                NetworkDevice device = store.get(current);
                if (device == null || device.getLinks() == null) {
                    continue;
                }
                for (NetworkLink link : device.getLinks()) {
                    if (link.getTargetDevice() == null) {
                        continue;
                    }
                    String neighborId = link.getTargetDevice().getId();
                    if (visited.add(neighborId)) {
                        distance.put(neighborId, dist + 1);
                        queue.add(neighborId);
                    }
                }
            }
            return visited.stream().map(store::get).filter(Objects::nonNull).toList();
        }
    }

    static class InMemoryNetworkServiceRepository extends InMemoryRepositoryBase<NetworkService, String>
            implements NetworkServiceRepository {

        @Override
        protected String idOf(NetworkService service) {
            return service.getId();
        }

        @Override
        public <S extends NetworkService> S save(S service) {
            return put(service);
        }

        @Override
        public <S extends NetworkService> List<S> saveAll(Iterable<S> entities) {
            List<S> saved = new ArrayList<>();
            entities.forEach(e -> saved.add(save(e)));
            return saved;
        }

        @Override
        public Optional<NetworkService> findById(String id) {
            return Optional.ofNullable(store.get(id));
        }

        @Override
        public boolean existsById(String id) {
            return id != null && store.containsKey(id);
        }

        @Override
        public List<NetworkService> findAll() {
            return new ArrayList<>(store.values());
        }

        @Override
        public List<NetworkService> findAll(Sort sort) {
            return sorted(findAll(), sort);
        }

        @Override
        public Page<NetworkService> findAll(Pageable pageable) {
            return paged(findAll(), pageable);
        }

        @Override
        public List<NetworkService> findAllById(Iterable<String> ids) {
            List<NetworkService> result = new ArrayList<>();
            for (String id : ids) {
                NetworkService service = store.get(id);
                if (service != null) {
                    result.add(service);
                }
            }
            return result;
        }

        @Override
        public long count() {
            return store.size();
        }

        @Override
        public void deleteById(String id) {
            store.remove(id);
        }

        @Override
        public void delete(NetworkService entity) {
            store.remove(idOf(entity));
        }

        @Override
        public void deleteAllById(Iterable<? extends String> ids) {
            ids.forEach(store::remove);
        }

        @Override
        public void deleteAll(Iterable<? extends NetworkService> entities) {
            for (NetworkService entity : entities) {
                store.remove(idOf(entity));
            }
        }

        @Override
        public void deleteAll() {
            store.clear();
        }

        @Override
        public <S extends NetworkService> Optional<S> findOne(Example<S> example) {
            throw unsupportedExampleQuery();
        }

        @Override
        public <S extends NetworkService> List<S> findAll(Example<S> example) {
            throw unsupportedExampleQuery();
        }

        @Override
        public <S extends NetworkService> List<S> findAll(Example<S> example, Sort sort) {
            throw unsupportedExampleQuery();
        }

        @Override
        public <S extends NetworkService> Page<S> findAll(Example<S> example, Pageable pageable) {
            throw unsupportedExampleQuery();
        }

        @Override
        public <S extends NetworkService, R> R findBy(Example<S> example,
                Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) {
            throw unsupportedExampleQuery();
        }

        @Override
        public <S extends NetworkService> long count(Example<S> example) {
            throw unsupportedExampleQuery();
        }

        @Override
        public <S extends NetworkService> boolean exists(Example<S> example) {
            throw unsupportedExampleQuery();
        }

        @Override
        public List<NetworkService> findByType(ServiceType type) {
            return store.values().stream()
                    .filter(s -> s.getType() == type)
                    .toList();
        }

        @Override
        public List<NetworkService> findByRegion(String region) {
            return store.values().stream()
                    .filter(s -> Objects.equals(s.getRegion(), region))
                    .toList();
        }

        @Override
        public List<NetworkService> findByStatus(ServiceStatus status) {
            return store.values().stream()
                    .filter(s -> s.getStatus() == status)
                    .toList();
        }

        @Override
        public List<NetworkService> findAllWithDevices() {
            return findAll();
        }

        @Override
        public Optional<NetworkService> findByIdWithDevices(String serviceId) {
            return findById(serviceId);
        }
    }
}
