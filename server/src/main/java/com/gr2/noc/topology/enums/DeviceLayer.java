package com.gr2.noc.topology.enums;

/**
 * Stratified telecommunication network tier bands:
 * - PEER: International / IXP Peering Routers (Tier 1)
 * - IGW: National Border Internet Gateways (Tier 1)
 * - CORE: Provincial / Regional Core Backbone Routers (Tier 2)
 * - AGGREGATION: Edge Aggregation Routers (Tier 3)
 * - EXCHANGE: Metro Central Office Exchange Hubs (Tier 4)
 * - ACCESS: Access Layer Switches (Tier 5)
 */
public enum DeviceLayer {
    PEER,
    IGW,
    CORE,
    AGGREGATION,
    EXCHANGE,
    ACCESS
}
