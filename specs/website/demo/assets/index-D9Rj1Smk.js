import{b as o,j as e,r as We,a as Ws,R as Us}from"./vendor-react-DAGQPzjI.js";import{N as Ma,H as an,P as sn,e as Oe,g as Gs,c as qs,E as Ks,d as Zs,u as Js,i as Ys,C as Qs,S as Xs,B as eo,a as no,b as ro,M as to,f as mt,V as ao}from"./vendor-reactflow-DqO3w_dx.js";(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&s(l)}).observe(document,{childList:!0,subtree:!0});function t(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(a){if(a.ep)return;a.ep=!0;const i=t(a);fetch(a.href,i)}})();const so=`{\r
 "version": 8,\r
 "exportedAt": "2026-06-07T00:00:00Z",\r
 "settings": {\r
  "presetName": "Software Architecture",\r
  "paramDefs": [\r
   {\r
    "id": "b1000000-0000-0000-0000-000000000001",\r
    "presetId": "b0000000-0000-0000-0000-000000000001",\r
    "displayName": "Type",\r
    "paramType": "select_color",\r
    "defaultValue": null,\r
    "drivesColor": true,\r
    "showOnCardDefault": true,\r
    "sortOrder": 0,\r
    "options": [\r
     {\r
      "id": "b2000000-0000-0000-0000-000000000000",\r
      "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
      "valueSlug": "gateway",\r
      "label": "Gateway",\r
      "color": "#d68b2a",\r
      "sortOrder": 0\r
     },\r
     {\r
      "id": "b2000000-0000-0000-0000-000000000001",\r
      "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
      "valueSlug": "service",\r
      "label": "Service",\r
      "color": "#5588bb",\r
      "sortOrder": 1\r
     },\r
     {\r
      "id": "b2000000-0000-0000-0000-000000000002",\r
      "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
      "valueSlug": "datastore",\r
      "label": "Datastore",\r
      "color": "#3d9e5f",\r
      "sortOrder": 2\r
     },\r
     {\r
      "id": "b2000000-0000-0000-0000-000000000003",\r
      "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
      "valueSlug": "cache",\r
      "label": "Cache",\r
      "color": "#00b0c8",\r
      "sortOrder": 3\r
     },\r
     {\r
      "id": "b2000000-0000-0000-0000-000000000004",\r
      "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
      "valueSlug": "queue",\r
      "label": "Queue",\r
      "color": "#7766aa",\r
      "sortOrder": 4\r
     },\r
     {\r
      "id": "b2000000-0000-0000-0000-000000000005",\r
      "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
      "valueSlug": "external",\r
      "label": "External",\r
      "color": "#888888",\r
      "sortOrder": 5\r
     }\r
    ]\r
   },\r
   {\r
    "id": "b1000000-0000-0000-0000-000000000002",\r
    "presetId": "b0000000-0000-0000-0000-000000000001",\r
    "displayName": "Owner",\r
    "paramType": "text",\r
    "defaultValue": null,\r
    "drivesColor": false,\r
    "showOnCardDefault": false,\r
    "sortOrder": 1,\r
    "options": []\r
   }\r
  ],\r
  "edgeParamDefs": [\r
   {\r
    "id": "b3000000-0000-0000-0000-000000000001",\r
    "presetId": "b0000000-0000-0000-0000-000000000001",\r
    "displayName": "Relation",\r
    "paramType": "select_color",\r
    "defaultValue": null,\r
    "drivesArrow": false,\r
    "drivesStyle": false,\r
    "drivesColor": true,\r
    "drivesWidth": false,\r
    "sortOrder": 0,\r
    "options": [\r
     {\r
      "id": "b4000000-0000-0000-0000-000000000000",\r
      "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
      "valueSlug": "calls",\r
      "label": "Calls",\r
      "color": "#d68b2a",\r
      "sortOrder": 0\r
     },\r
     {\r
      "id": "b4000000-0000-0000-0000-000000000001",\r
      "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
      "valueSlug": "depends-on",\r
      "label": "Depends on",\r
      "color": "#5588bb",\r
      "sortOrder": 1\r
     },\r
     {\r
      "id": "b4000000-0000-0000-0000-000000000002",\r
      "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
      "valueSlug": "reads",\r
      "label": "Reads",\r
      "color": "#3d9e5f",\r
      "sortOrder": 2\r
     },\r
     {\r
      "id": "b4000000-0000-0000-0000-000000000003",\r
      "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
      "valueSlug": "writes",\r
      "label": "Writes",\r
      "color": "#c83030",\r
      "sortOrder": 3\r
     },\r
     {\r
      "id": "b4000000-0000-0000-0000-000000000004",\r
      "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
      "valueSlug": "publishes-to",\r
      "label": "Publishes to",\r
      "color": "#7766aa",\r
      "sortOrder": 4\r
     },\r
     {\r
      "id": "b4000000-0000-0000-0000-000000000005",\r
      "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
      "valueSlug": "subscribes-to",\r
      "label": "Subscribes to",\r
      "color": "#00b0c8",\r
      "sortOrder": 5\r
     }\r
    ]\r
   },\r
   {\r
    "id": "b3000000-0000-0000-0000-000000000002",\r
    "presetId": "b0000000-0000-0000-0000-000000000001",\r
    "displayName": "Directed",\r
    "paramType": "boolean",\r
    "defaultValue": "true",\r
    "drivesArrow": true,\r
    "drivesStyle": false,\r
    "drivesColor": false,\r
    "drivesWidth": false,\r
    "sortOrder": 1,\r
    "options": []\r
   },\r
   {\r
    "id": "b3000000-0000-0000-0000-000000000003",\r
    "presetId": "b0000000-0000-0000-0000-000000000001",\r
    "displayName": "Notes",\r
    "paramType": "text",\r
    "defaultValue": null,\r
    "drivesArrow": false,\r
    "drivesStyle": false,\r
    "drivesColor": false,\r
    "drivesWidth": false,\r
    "sortOrder": 2,\r
    "options": []\r
   }\r
  ]\r
 },\r
 "nodes": [\r
  {\r
   "id": "b5000000-0000-0000-0000-000000000001",\r
   "title": "Web App",\r
   "description": "Customer-facing React app. Talks to the platform only through the API Gateway.",\r
   "eventDate": null,\r
   "dateAdded": "2026-06-07T00:00:00Z",\r
   "x": 0.0,\r
   "y": 80.0,\r
   "color": null,\r
   "confidence": null,\r
   "impactMagnitude": null,\r
   "tags": [],\r
   "links": [],\r
   "media": [],\r
   "paramValues": [\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000001",\r
     "nodeId": "b5000000-0000-0000-0000-000000000001",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
     "value": "service",\r
     "isEnabled": true,\r
     "showOnCard": true\r
    },\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000101",\r
     "nodeId": "b5000000-0000-0000-0000-000000000001",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
     "value": "Frontend",\r
     "isEnabled": true,\r
     "showOnCard": false\r
    }\r
   ],\r
   "isPinned": false,\r
   "isExpandPinned": false,\r
   "zOrder": 0,\r
   "kind": "standard",\r
   "width": null,\r
   "height": null\r
  },\r
  {\r
   "id": "b5000000-0000-0000-0000-000000000002",\r
   "title": "Mobile App",\r
   "description": "iOS/Android client. Same public API surface as the web app.",\r
   "eventDate": null,\r
   "dateAdded": "2026-06-07T00:00:00Z",\r
   "x": 0.0,\r
   "y": 240.0,\r
   "color": null,\r
   "confidence": null,\r
   "impactMagnitude": null,\r
   "tags": [],\r
   "links": [],\r
   "media": [],\r
   "paramValues": [\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000002",\r
     "nodeId": "b5000000-0000-0000-0000-000000000002",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
     "value": "service",\r
     "isEnabled": true,\r
     "showOnCard": true\r
    },\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000102",\r
     "nodeId": "b5000000-0000-0000-0000-000000000002",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
     "value": "Frontend",\r
     "isEnabled": true,\r
     "showOnCard": false\r
    }\r
   ],\r
   "isPinned": false,\r
   "isExpandPinned": false,\r
   "zOrder": 0,\r
   "kind": "standard",\r
   "width": null,\r
   "height": null\r
  },\r
  {\r
   "id": "b5000000-0000-0000-0000-000000000003",\r
   "title": "API Gateway",\r
   "description": "Edge router + auth check. Fans requests out to the core services.",\r
   "eventDate": null,\r
   "dateAdded": "2026-06-07T00:00:00Z",\r
   "x": 300.0,\r
   "y": 160.0,\r
   "color": null,\r
   "confidence": null,\r
   "impactMagnitude": null,\r
   "tags": [],\r
   "links": [],\r
   "media": [],\r
   "paramValues": [\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000003",\r
     "nodeId": "b5000000-0000-0000-0000-000000000003",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
     "value": "gateway",\r
     "isEnabled": true,\r
     "showOnCard": true\r
    },\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000103",\r
     "nodeId": "b5000000-0000-0000-0000-000000000003",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
     "value": "Platform",\r
     "isEnabled": true,\r
     "showOnCard": false\r
    }\r
   ],\r
   "isPinned": false,\r
   "isExpandPinned": false,\r
   "zOrder": 0,\r
   "kind": "standard",\r
   "width": null,\r
   "height": null\r
  },\r
  {\r
   "id": "b5000000-0000-0000-0000-000000000004",\r
   "title": "Auth Service",\r
   "description": "Issues and validates session tokens. Most services depend on it.",\r
   "eventDate": null,\r
   "dateAdded": "2026-06-07T00:00:00Z",\r
   "x": 620.0,\r
   "y": -40.0,\r
   "color": null,\r
   "confidence": null,\r
   "impactMagnitude": null,\r
   "tags": [],\r
   "links": [],\r
   "media": [],\r
   "paramValues": [\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000004",\r
     "nodeId": "b5000000-0000-0000-0000-000000000004",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
     "value": "service",\r
     "isEnabled": true,\r
     "showOnCard": true\r
    },\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000104",\r
     "nodeId": "b5000000-0000-0000-0000-000000000004",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
     "value": "Identity",\r
     "isEnabled": true,\r
     "showOnCard": false\r
    }\r
   ],\r
   "isPinned": false,\r
   "isExpandPinned": false,\r
   "zOrder": 0,\r
   "kind": "standard",\r
   "width": null,\r
   "height": null\r
  },\r
  {\r
   "id": "b5000000-0000-0000-0000-000000000005",\r
   "title": "Payments Service",\r
   "description": "Owns /charge and /refund. Calls Stripe and writes the payments ledger.",\r
   "eventDate": null,\r
   "dateAdded": "2026-06-07T00:00:00Z",\r
   "x": 620.0,\r
   "y": 140.0,\r
   "color": null,\r
   "confidence": null,\r
   "impactMagnitude": null,\r
   "tags": [],\r
   "links": [],\r
   "media": [],\r
   "paramValues": [\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000005",\r
     "nodeId": "b5000000-0000-0000-0000-000000000005",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
     "value": "service",\r
     "isEnabled": true,\r
     "showOnCard": true\r
    },\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000105",\r
     "nodeId": "b5000000-0000-0000-0000-000000000005",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
     "value": "Payments",\r
     "isEnabled": true,\r
     "showOnCard": false\r
    }\r
   ],\r
   "isPinned": false,\r
   "isExpandPinned": false,\r
   "zOrder": 0,\r
   "kind": "standard",\r
   "width": null,\r
   "height": null\r
  },\r
  {\r
   "id": "b5000000-0000-0000-0000-000000000006",\r
   "title": "Orders Service",\r
   "description": "Owns the order lifecycle; writes orders and emits order events.",\r
   "eventDate": null,\r
   "dateAdded": "2026-06-07T00:00:00Z",\r
   "x": 620.0,\r
   "y": 320.0,\r
   "color": null,\r
   "confidence": null,\r
   "impactMagnitude": null,\r
   "tags": [],\r
   "links": [],\r
   "media": [],\r
   "paramValues": [\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000006",\r
     "nodeId": "b5000000-0000-0000-0000-000000000006",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
     "value": "service",\r
     "isEnabled": true,\r
     "showOnCard": true\r
    },\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000106",\r
     "nodeId": "b5000000-0000-0000-0000-000000000006",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
     "value": "Commerce",\r
     "isEnabled": true,\r
     "showOnCard": false\r
    }\r
   ],\r
   "isPinned": false,\r
   "isExpandPinned": false,\r
   "zOrder": 0,\r
   "kind": "standard",\r
   "width": null,\r
   "height": null\r
  },\r
  {\r
   "id": "b5000000-0000-0000-0000-000000000007",\r
   "title": "Notifications Service",\r
   "description": "Sends email/SMS off the event bus (order confirmations, receipts).",\r
   "eventDate": null,\r
   "dateAdded": "2026-06-07T00:00:00Z",\r
   "x": 620.0,\r
   "y": 500.0,\r
   "color": null,\r
   "confidence": null,\r
   "impactMagnitude": null,\r
   "tags": [],\r
   "links": [],\r
   "media": [],\r
   "paramValues": [\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000007",\r
     "nodeId": "b5000000-0000-0000-0000-000000000007",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
     "value": "service",\r
     "isEnabled": true,\r
     "showOnCard": true\r
    },\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000107",\r
     "nodeId": "b5000000-0000-0000-0000-000000000007",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
     "value": "Growth",\r
     "isEnabled": true,\r
     "showOnCard": false\r
    }\r
   ],\r
   "isPinned": false,\r
   "isExpandPinned": false,\r
   "zOrder": 0,\r
   "kind": "standard",\r
   "width": null,\r
   "height": null\r
  },\r
  {\r
   "id": "b5000000-0000-0000-0000-000000000008",\r
   "title": "Redis Cache",\r
   "description": "Shared session + hot-path cache. Read by Auth and Orders.",\r
   "eventDate": null,\r
   "dateAdded": "2026-06-07T00:00:00Z",\r
   "x": 940.0,\r
   "y": -40.0,\r
   "color": null,\r
   "confidence": null,\r
   "impactMagnitude": null,\r
   "tags": [],\r
   "links": [],\r
   "media": [],\r
   "paramValues": [\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000008",\r
     "nodeId": "b5000000-0000-0000-0000-000000000008",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
     "value": "cache",\r
     "isEnabled": true,\r
     "showOnCard": true\r
    },\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000108",\r
     "nodeId": "b5000000-0000-0000-0000-000000000008",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
     "value": "Platform",\r
     "isEnabled": true,\r
     "showOnCard": false\r
    }\r
   ],\r
   "isPinned": false,\r
   "isExpandPinned": false,\r
   "zOrder": 0,\r
   "kind": "standard",\r
   "width": null,\r
   "height": null\r
  },\r
  {\r
   "id": "b5000000-0000-0000-0000-000000000009",\r
   "title": "Payments DB",\r
   "description": "Postgres. Source of truth for charges, refunds, and payout state.",\r
   "eventDate": null,\r
   "dateAdded": "2026-06-07T00:00:00Z",\r
   "x": 940.0,\r
   "y": 140.0,\r
   "color": null,\r
   "confidence": null,\r
   "impactMagnitude": null,\r
   "tags": [],\r
   "links": [],\r
   "media": [],\r
   "paramValues": [\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000009",\r
     "nodeId": "b5000000-0000-0000-0000-000000000009",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
     "value": "datastore",\r
     "isEnabled": true,\r
     "showOnCard": true\r
    },\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000109",\r
     "nodeId": "b5000000-0000-0000-0000-000000000009",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
     "value": "Payments",\r
     "isEnabled": true,\r
     "showOnCard": false\r
    }\r
   ],\r
   "isPinned": false,\r
   "isExpandPinned": false,\r
   "zOrder": 0,\r
   "kind": "standard",\r
   "width": null,\r
   "height": null\r
  },\r
  {\r
   "id": "b5000000-0000-0000-0000-000000000010",\r
   "title": "Orders DB",\r
   "description": "Postgres. Orders, line items, and fulfilment status.",\r
   "eventDate": null,\r
   "dateAdded": "2026-06-07T00:00:00Z",\r
   "x": 940.0,\r
   "y": 320.0,\r
   "color": null,\r
   "confidence": null,\r
   "impactMagnitude": null,\r
   "tags": [],\r
   "links": [],\r
   "media": [],\r
   "paramValues": [\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000010",\r
     "nodeId": "b5000000-0000-0000-0000-000000000010",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
     "value": "datastore",\r
     "isEnabled": true,\r
     "showOnCard": true\r
    },\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000110",\r
     "nodeId": "b5000000-0000-0000-0000-000000000010",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
     "value": "Commerce",\r
     "isEnabled": true,\r
     "showOnCard": false\r
    }\r
   ],\r
   "isPinned": false,\r
   "isExpandPinned": false,\r
   "zOrder": 0,\r
   "kind": "standard",\r
   "width": null,\r
   "height": null\r
  },\r
  {\r
   "id": "b5000000-0000-0000-0000-000000000011",\r
   "title": "Event Bus",\r
   "description": "Kafka. Order/payment events; decouples producers from consumers.",\r
   "eventDate": null,\r
   "dateAdded": "2026-06-07T00:00:00Z",\r
   "x": 940.0,\r
   "y": 500.0,\r
   "color": null,\r
   "confidence": null,\r
   "impactMagnitude": null,\r
   "tags": [],\r
   "links": [],\r
   "media": [],\r
   "paramValues": [\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000011",\r
     "nodeId": "b5000000-0000-0000-0000-000000000011",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
     "value": "queue",\r
     "isEnabled": true,\r
     "showOnCard": true\r
    },\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000111",\r
     "nodeId": "b5000000-0000-0000-0000-000000000011",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
     "value": "Platform",\r
     "isEnabled": true,\r
     "showOnCard": false\r
    }\r
   ],\r
   "isPinned": false,\r
   "isExpandPinned": false,\r
   "zOrder": 0,\r
   "kind": "standard",\r
   "width": null,\r
   "height": null\r
  },\r
  {\r
   "id": "b5000000-0000-0000-0000-000000000012",\r
   "title": "Stripe",\r
   "description": "Third-party card processor. Called by Payments to capture funds.",\r
   "eventDate": null,\r
   "dateAdded": "2026-06-07T00:00:00Z",\r
   "x": 1260.0,\r
   "y": 140.0,\r
   "color": null,\r
   "confidence": null,\r
   "impactMagnitude": null,\r
   "tags": [],\r
   "links": [],\r
   "media": [],\r
   "paramValues": [\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000012",\r
     "nodeId": "b5000000-0000-0000-0000-000000000012",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
     "value": "external",\r
     "isEnabled": true,\r
     "showOnCard": true\r
    }\r
   ],\r
   "isPinned": false,\r
   "isExpandPinned": false,\r
   "zOrder": 0,\r
   "kind": "standard",\r
   "width": null,\r
   "height": null\r
  },\r
  {\r
   "id": "b5000000-0000-0000-0000-000000000013",\r
   "title": "SendGrid",\r
   "description": "Third-party email provider used by Notifications.",\r
   "eventDate": null,\r
   "dateAdded": "2026-06-07T00:00:00Z",\r
   "x": 1260.0,\r
   "y": 500.0,\r
   "color": null,\r
   "confidence": null,\r
   "impactMagnitude": null,\r
   "tags": [],\r
   "links": [],\r
   "media": [],\r
   "paramValues": [\r
    {\r
     "id": "b6000000-0000-0000-0000-000000000013",\r
     "nodeId": "b5000000-0000-0000-0000-000000000013",\r
     "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
     "value": "external",\r
     "isEnabled": true,\r
     "showOnCard": true\r
    }\r
   ],\r
   "isPinned": false,\r
   "isExpandPinned": false,\r
   "zOrder": 0,\r
   "kind": "standard",\r
   "width": null,\r
   "height": null\r
  },\r
  {\r
   "id": "b5000000-0000-0000-0000-0000000000ff",\r
   "title": "",\r
   "description": "Software architecture map \\u2014 a payments platform.\\n\\nEvery box is a typed node and every arrow a classified dependency, so this is queryable data, not just a picture. Right-click a node and \\"Trace upstream\\" to see its blast radius (e.g. what breaks if Auth Service or Redis goes down).",\r
   "eventDate": null,\r
   "dateAdded": "2026-06-07T00:00:00Z",\r
   "x": 0.0,\r
   "y": 440.0,\r
   "color": null,\r
   "confidence": null,\r
   "impactMagnitude": null,\r
   "tags": [],\r
   "links": [],\r
   "media": [],\r
   "paramValues": [],\r
   "isPinned": false,\r
   "isExpandPinned": false,\r
   "zOrder": 0,\r
   "kind": "note",\r
   "width": 260.0,\r
   "height": 150.0\r
  }\r
 ],\r
 "edges": [\r
  {\r
   "id": "be000000-0000-0000-0000-000000000001",\r
   "sourceId": "b5000000-0000-0000-0000-000000000001",\r
   "targetId": "b5000000-0000-0000-0000-000000000003",\r
   "sourceHandle": "right",\r
   "targetHandle": "left",\r
   "waypoints": null,\r
   "paramValues": [\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000101",\r
     "edgeId": "be000000-0000-0000-0000-000000000001",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
     "value": "calls",\r
     "isEnabled": true\r
    },\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000201",\r
     "edgeId": "be000000-0000-0000-0000-000000000001",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
     "value": "true",\r
     "isEnabled": true\r
    }\r
   ],\r
   "color": "#d68b2a"\r
  },\r
  {\r
   "id": "be000000-0000-0000-0000-000000000002",\r
   "sourceId": "b5000000-0000-0000-0000-000000000002",\r
   "targetId": "b5000000-0000-0000-0000-000000000003",\r
   "sourceHandle": "right",\r
   "targetHandle": "left",\r
   "waypoints": null,\r
   "paramValues": [\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000102",\r
     "edgeId": "be000000-0000-0000-0000-000000000002",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
     "value": "calls",\r
     "isEnabled": true\r
    },\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000202",\r
     "edgeId": "be000000-0000-0000-0000-000000000002",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
     "value": "true",\r
     "isEnabled": true\r
    }\r
   ],\r
   "color": "#d68b2a"\r
  },\r
  {\r
   "id": "be000000-0000-0000-0000-000000000003",\r
   "sourceId": "b5000000-0000-0000-0000-000000000003",\r
   "targetId": "b5000000-0000-0000-0000-000000000004",\r
   "sourceHandle": "right",\r
   "targetHandle": "left",\r
   "waypoints": null,\r
   "paramValues": [\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000103",\r
     "edgeId": "be000000-0000-0000-0000-000000000003",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
     "value": "calls",\r
     "isEnabled": true\r
    },\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000203",\r
     "edgeId": "be000000-0000-0000-0000-000000000003",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
     "value": "true",\r
     "isEnabled": true\r
    }\r
   ],\r
   "color": "#d68b2a"\r
  },\r
  {\r
   "id": "be000000-0000-0000-0000-000000000004",\r
   "sourceId": "b5000000-0000-0000-0000-000000000003",\r
   "targetId": "b5000000-0000-0000-0000-000000000005",\r
   "sourceHandle": "right",\r
   "targetHandle": "left",\r
   "waypoints": null,\r
   "paramValues": [\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000104",\r
     "edgeId": "be000000-0000-0000-0000-000000000004",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
     "value": "calls",\r
     "isEnabled": true\r
    },\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000204",\r
     "edgeId": "be000000-0000-0000-0000-000000000004",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
     "value": "true",\r
     "isEnabled": true\r
    }\r
   ],\r
   "color": "#d68b2a"\r
  },\r
  {\r
   "id": "be000000-0000-0000-0000-000000000005",\r
   "sourceId": "b5000000-0000-0000-0000-000000000003",\r
   "targetId": "b5000000-0000-0000-0000-000000000006",\r
   "sourceHandle": "right",\r
   "targetHandle": "left",\r
   "waypoints": null,\r
   "paramValues": [\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000105",\r
     "edgeId": "be000000-0000-0000-0000-000000000005",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
     "value": "calls",\r
     "isEnabled": true\r
    },\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000205",\r
     "edgeId": "be000000-0000-0000-0000-000000000005",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
     "value": "true",\r
     "isEnabled": true\r
    }\r
   ],\r
   "color": "#d68b2a"\r
  },\r
  {\r
   "id": "be000000-0000-0000-0000-000000000006",\r
   "sourceId": "b5000000-0000-0000-0000-000000000005",\r
   "targetId": "b5000000-0000-0000-0000-000000000004",\r
   "sourceHandle": "top",\r
   "targetHandle": "bottom",\r
   "waypoints": null,\r
   "paramValues": [\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000106",\r
     "edgeId": "be000000-0000-0000-0000-000000000006",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
     "value": "depends-on",\r
     "isEnabled": true\r
    },\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000206",\r
     "edgeId": "be000000-0000-0000-0000-000000000006",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
     "value": "true",\r
     "isEnabled": true\r
    }\r
   ],\r
   "color": "#5588bb"\r
  },\r
  {\r
   "id": "be000000-0000-0000-0000-000000000007",\r
   "sourceId": "b5000000-0000-0000-0000-000000000006",\r
   "targetId": "b5000000-0000-0000-0000-000000000004",\r
   "sourceHandle": "top",\r
   "targetHandle": "bottom",\r
   "waypoints": null,\r
   "paramValues": [\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000107",\r
     "edgeId": "be000000-0000-0000-0000-000000000007",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
     "value": "depends-on",\r
     "isEnabled": true\r
    },\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000207",\r
     "edgeId": "be000000-0000-0000-0000-000000000007",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
     "value": "true",\r
     "isEnabled": true\r
    }\r
   ],\r
   "color": "#5588bb"\r
  },\r
  {\r
   "id": "be000000-0000-0000-0000-000000000008",\r
   "sourceId": "b5000000-0000-0000-0000-000000000005",\r
   "targetId": "b5000000-0000-0000-0000-000000000009",\r
   "sourceHandle": "right",\r
   "targetHandle": "left",\r
   "waypoints": null,\r
   "paramValues": [\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000108",\r
     "edgeId": "be000000-0000-0000-0000-000000000008",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
     "value": "writes",\r
     "isEnabled": true\r
    },\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000208",\r
     "edgeId": "be000000-0000-0000-0000-000000000008",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
     "value": "true",\r
     "isEnabled": true\r
    }\r
   ],\r
   "color": "#c83030"\r
  },\r
  {\r
   "id": "be000000-0000-0000-0000-000000000009",\r
   "sourceId": "b5000000-0000-0000-0000-000000000006",\r
   "targetId": "b5000000-0000-0000-0000-000000000010",\r
   "sourceHandle": "right",\r
   "targetHandle": "left",\r
   "waypoints": null,\r
   "paramValues": [\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000109",\r
     "edgeId": "be000000-0000-0000-0000-000000000009",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
     "value": "writes",\r
     "isEnabled": true\r
    },\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000209",\r
     "edgeId": "be000000-0000-0000-0000-000000000009",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
     "value": "true",\r
     "isEnabled": true\r
    }\r
   ],\r
   "color": "#c83030"\r
  },\r
  {\r
   "id": "be000000-0000-0000-0000-000000000010",\r
   "sourceId": "b5000000-0000-0000-0000-000000000004",\r
   "targetId": "b5000000-0000-0000-0000-000000000008",\r
   "sourceHandle": "right",\r
   "targetHandle": "left",\r
   "waypoints": null,\r
   "paramValues": [\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000110",\r
     "edgeId": "be000000-0000-0000-0000-000000000010",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
     "value": "reads",\r
     "isEnabled": true\r
    },\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000210",\r
     "edgeId": "be000000-0000-0000-0000-000000000010",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
     "value": "true",\r
     "isEnabled": true\r
    }\r
   ],\r
   "color": "#3d9e5f"\r
  },\r
  {\r
   "id": "be000000-0000-0000-0000-000000000011",\r
   "sourceId": "b5000000-0000-0000-0000-000000000006",\r
   "targetId": "b5000000-0000-0000-0000-000000000008",\r
   "sourceHandle": "top",\r
   "targetHandle": "bottom",\r
   "waypoints": null,\r
   "paramValues": [\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000111",\r
     "edgeId": "be000000-0000-0000-0000-000000000011",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
     "value": "reads",\r
     "isEnabled": true\r
    },\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000211",\r
     "edgeId": "be000000-0000-0000-0000-000000000011",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
     "value": "true",\r
     "isEnabled": true\r
    }\r
   ],\r
   "color": "#3d9e5f"\r
  },\r
  {\r
   "id": "be000000-0000-0000-0000-000000000012",\r
   "sourceId": "b5000000-0000-0000-0000-000000000005",\r
   "targetId": "b5000000-0000-0000-0000-000000000012",\r
   "sourceHandle": "right",\r
   "targetHandle": "left",\r
   "waypoints": null,\r
   "paramValues": [\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000112",\r
     "edgeId": "be000000-0000-0000-0000-000000000012",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
     "value": "calls",\r
     "isEnabled": true\r
    },\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000212",\r
     "edgeId": "be000000-0000-0000-0000-000000000012",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
     "value": "true",\r
     "isEnabled": true\r
    }\r
   ],\r
   "color": "#d68b2a"\r
  },\r
  {\r
   "id": "be000000-0000-0000-0000-000000000013",\r
   "sourceId": "b5000000-0000-0000-0000-000000000005",\r
   "targetId": "b5000000-0000-0000-0000-000000000011",\r
   "sourceHandle": "bottom",\r
   "targetHandle": "top",\r
   "waypoints": null,\r
   "paramValues": [\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000113",\r
     "edgeId": "be000000-0000-0000-0000-000000000013",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
     "value": "publishes-to",\r
     "isEnabled": true\r
    },\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000213",\r
     "edgeId": "be000000-0000-0000-0000-000000000013",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
     "value": "true",\r
     "isEnabled": true\r
    }\r
   ],\r
   "color": "#7766aa"\r
  },\r
  {\r
   "id": "be000000-0000-0000-0000-000000000014",\r
   "sourceId": "b5000000-0000-0000-0000-000000000006",\r
   "targetId": "b5000000-0000-0000-0000-000000000011",\r
   "sourceHandle": "right",\r
   "targetHandle": "left",\r
   "waypoints": null,\r
   "paramValues": [\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000114",\r
     "edgeId": "be000000-0000-0000-0000-000000000014",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
     "value": "publishes-to",\r
     "isEnabled": true\r
    },\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000214",\r
     "edgeId": "be000000-0000-0000-0000-000000000014",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
     "value": "true",\r
     "isEnabled": true\r
    }\r
   ],\r
   "color": "#7766aa"\r
  },\r
  {\r
   "id": "be000000-0000-0000-0000-000000000015",\r
   "sourceId": "b5000000-0000-0000-0000-000000000007",\r
   "targetId": "b5000000-0000-0000-0000-000000000011",\r
   "sourceHandle": "right",\r
   "targetHandle": "left",\r
   "waypoints": null,\r
   "paramValues": [\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000115",\r
     "edgeId": "be000000-0000-0000-0000-000000000015",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
     "value": "subscribes-to",\r
     "isEnabled": true\r
    },\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000215",\r
     "edgeId": "be000000-0000-0000-0000-000000000015",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
     "value": "true",\r
     "isEnabled": true\r
    }\r
   ],\r
   "color": "#00b0c8"\r
  },\r
  {\r
   "id": "be000000-0000-0000-0000-000000000016",\r
   "sourceId": "b5000000-0000-0000-0000-000000000007",\r
   "targetId": "b5000000-0000-0000-0000-000000000013",\r
   "sourceHandle": "right",\r
   "targetHandle": "left",\r
   "waypoints": null,\r
   "paramValues": [\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000116",\r
     "edgeId": "be000000-0000-0000-0000-000000000016",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
     "value": "calls",\r
     "isEnabled": true\r
    },\r
    {\r
     "id": "bf000000-0000-0000-0000-000000000216",\r
     "edgeId": "be000000-0000-0000-0000-000000000016",\r
     "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
     "value": "true",\r
     "isEnabled": true\r
    }\r
   ],\r
   "color": "#d68b2a"\r
  }\r
 ],\r
 "regions": [\r
  {\r
   "id": "b7000000-0000-0000-0000-000000000001",\r
   "title": "Core services",\r
   "x": 580.0,\r
   "y": -100.0,\r
   "width": 300.0,\r
   "height": 720.0,\r
   "color": "#5588bb",\r
   "zOrder": 0,\r
   "isLocked": false,\r
   "isMinimized": false,\r
   "createdAt": "2026-06-07T00:00:00Z"\r
  },\r
  {\r
   "id": "b7000000-0000-0000-0000-000000000002",\r
   "title": "Data & messaging",\r
   "x": 900.0,\r
   "y": -100.0,\r
   "width": 300.0,\r
   "height": 720.0,\r
   "color": "#3d9e5f",\r
   "zOrder": 0,\r
   "isLocked": false,\r
   "isMinimized": false,\r
   "createdAt": "2026-06-07T00:00:00Z"\r
  },\r
  {\r
   "id": "b7000000-0000-0000-0000-000000000003",\r
   "title": "Third-party",\r
   "x": 1220.0,\r
   "y": 100.0,\r
   "width": 260.0,\r
   "height": 520.0,\r
   "color": "#888888",\r
   "zOrder": 0,\r
   "isLocked": false,\r
   "isMinimized": false,\r
   "createdAt": "2026-06-07T00:00:00Z"\r
  }\r
 ]\r
}`,oo=`{\r
  "version": 8,\r
  "exportedAt": "2026-06-04T00:00:00Z",\r
  "settings": {\r
    "presetName": "Agent Memory",\r
    "paramDefs": [\r
      {\r
        "id": "a1000000-0000-0000-0000-000000000001",\r
        "presetId": "a0000000-0000-0000-0000-000000000001",\r
        "displayName": "Type",\r
        "paramType": "select_color",\r
        "defaultValue": null,\r
        "drivesColor": true,\r
        "showOnCardDefault": true,\r
        "sortOrder": 0,\r
        "options": [\r
          {\r
            "id": "a2000000-0000-0000-0000-000000000001",\r
            "paramDefId": "a1000000-0000-0000-0000-000000000001",\r
            "valueSlug": "service",\r
            "label": "Service",\r
            "color": "#5588bb",\r
            "sortOrder": 0\r
          },\r
          {\r
            "id": "a2000000-0000-0000-0000-000000000002",\r
            "paramDefId": "a1000000-0000-0000-0000-000000000001",\r
            "valueSlug": "datastore",\r
            "label": "Datastore",\r
            "color": "#3d9e5f",\r
            "sortOrder": 1\r
          },\r
          {\r
            "id": "a2000000-0000-0000-0000-000000000003",\r
            "paramDefId": "a1000000-0000-0000-0000-000000000001",\r
            "valueSlug": "external",\r
            "label": "External",\r
            "color": "#888888",\r
            "sortOrder": 2\r
          },\r
          {\r
            "id": "a2000000-0000-0000-0000-000000000004",\r
            "paramDefId": "a1000000-0000-0000-0000-000000000001",\r
            "valueSlug": "person",\r
            "label": "Person",\r
            "color": "#d68b2a",\r
            "sortOrder": 3\r
          },\r
          {\r
            "id": "a2000000-0000-0000-0000-000000000005",\r
            "paramDefId": "a1000000-0000-0000-0000-000000000001",\r
            "valueSlug": "incident",\r
            "label": "Incident",\r
            "color": "#c83030",\r
            "sortOrder": 4\r
          },\r
          {\r
            "id": "a2000000-0000-0000-0000-000000000006",\r
            "paramDefId": "a1000000-0000-0000-0000-000000000001",\r
            "valueSlug": "decision",\r
            "label": "Decision",\r
            "color": "#7766aa",\r
            "sortOrder": 5\r
          }\r
        ]\r
      },\r
      {\r
        "id": "a1000000-0000-0000-0000-000000000002",\r
        "presetId": "a0000000-0000-0000-0000-000000000001",\r
        "displayName": "Confidence (%)",\r
        "paramType": "number",\r
        "defaultValue": null,\r
        "drivesColor": false,\r
        "showOnCardDefault": false,\r
        "sortOrder": 1,\r
        "options": []\r
      },\r
      {\r
        "id": "a1000000-0000-0000-0000-000000000003",\r
        "presetId": "a0000000-0000-0000-0000-000000000001",\r
        "displayName": "Source",\r
        "paramType": "text",\r
        "defaultValue": null,\r
        "drivesColor": false,\r
        "showOnCardDefault": false,\r
        "sortOrder": 2,\r
        "options": []\r
      }\r
    ],\r
    "edgeParamDefs": [\r
      {\r
        "id": "a3000000-0000-0000-0000-000000000001",\r
        "presetId": "a0000000-0000-0000-0000-000000000001",\r
        "displayName": "Relation",\r
        "paramType": "select_color",\r
        "defaultValue": null,\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": true,\r
        "drivesWidth": false,\r
        "sortOrder": 0,\r
        "options": [\r
          {\r
            "id": "a4000000-0000-0000-0000-000000000001",\r
            "paramDefId": "a3000000-0000-0000-0000-000000000001",\r
            "valueSlug": "depends-on",\r
            "label": "Depends on",\r
            "color": "#5588bb",\r
            "sortOrder": 0\r
          },\r
          {\r
            "id": "a4000000-0000-0000-0000-000000000002",\r
            "paramDefId": "a3000000-0000-0000-0000-000000000001",\r
            "valueSlug": "owns",\r
            "label": "Owns",\r
            "color": "#d68b2a",\r
            "sortOrder": 1\r
          },\r
          {\r
            "id": "a4000000-0000-0000-0000-000000000003",\r
            "paramDefId": "a3000000-0000-0000-0000-000000000001",\r
            "valueSlug": "caused",\r
            "label": "Caused",\r
            "color": "#c83030",\r
            "sortOrder": 2\r
          },\r
          {\r
            "id": "a4000000-0000-0000-0000-000000000004",\r
            "paramDefId": "a3000000-0000-0000-0000-000000000001",\r
            "valueSlug": "mitigates",\r
            "label": "Mitigates",\r
            "color": "#3d9e5f",\r
            "sortOrder": 3\r
          },\r
          {\r
            "id": "a4000000-0000-0000-0000-000000000005",\r
            "paramDefId": "a3000000-0000-0000-0000-000000000001",\r
            "valueSlug": "supersedes",\r
            "label": "Supersedes",\r
            "color": "#7766aa",\r
            "sortOrder": 4\r
          },\r
          {\r
            "id": "a4000000-0000-0000-0000-000000000006",\r
            "paramDefId": "a3000000-0000-0000-0000-000000000001",\r
            "valueSlug": "related",\r
            "label": "Related",\r
            "color": "#888888",\r
            "sortOrder": 5\r
          }\r
        ]\r
      },\r
      {\r
        "id": "a3000000-0000-0000-0000-000000000002",\r
        "presetId": "a0000000-0000-0000-0000-000000000001",\r
        "displayName": "Directed",\r
        "paramType": "boolean",\r
        "defaultValue": "true",\r
        "drivesArrow": true,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": false,\r
        "sortOrder": 1,\r
        "options": []\r
      },\r
      {\r
        "id": "a3000000-0000-0000-0000-000000000003",\r
        "presetId": "a0000000-0000-0000-0000-000000000001",\r
        "displayName": "Weight",\r
        "paramType": "number",\r
        "defaultValue": "2",\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": true,\r
        "sortOrder": 2,\r
        "options": []\r
      },\r
      {\r
        "id": "a3000000-0000-0000-0000-000000000004",\r
        "presetId": "a0000000-0000-0000-0000-000000000001",\r
        "displayName": "Notes",\r
        "paramType": "text",\r
        "defaultValue": null,\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": false,\r
        "sortOrder": 3,\r
        "options": []\r
      }\r
    ]\r
  },\r
  "nodes": [\r
    {\r
      "id": "a5000000-0000-0000-0000-000000000001",\r
      "title": "Billing API",\r
      "description": "Owns the /charge and /invoice routes. Calls Auth on every request and Stripe to capture cards.",\r
      "eventDate": null,\r
      "dateAdded": "2026-06-04T00:00:00Z",\r
      "x": 832.0,\r
      "y": 256.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "tags": [],\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "a6000000-0000-0000-0000-000000000011",\r
          "nodeId": "a5000000-0000-0000-0000-000000000001",\r
          "paramDefId": "a1000000-0000-0000-0000-000000000001",\r
          "value": "service",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false,\r
      "zOrder": 0,\r
      "kind": "standard",\r
      "width": null,\r
      "height": null\r
    },\r
    {\r
      "id": "a5000000-0000-0000-0000-000000000002",\r
      "title": "Auth Service",\r
      "description": "Issues and validates session tokens for every internal call. Owned by Priya.",\r
      "eventDate": null,\r
      "dateAdded": "2026-06-04T00:00:00Z",\r
      "x": 448.0,\r
      "y": 512.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "tags": [],\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "a6000000-0000-0000-0000-000000000021",\r
          "nodeId": "a5000000-0000-0000-0000-000000000002",\r
          "paramDefId": "a1000000-0000-0000-0000-000000000001",\r
          "value": "service",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false,\r
      "zOrder": 0,\r
      "kind": "standard",\r
      "width": null,\r
      "height": null\r
    },\r
    {\r
      "id": "a5000000-0000-0000-0000-000000000003",\r
      "title": "User Database",\r
      "description": "Postgres primary: accounts, sessions, entitlements. Single point of failure; hit connection limits on Oct 3.",\r
      "eventDate": null,\r
      "dateAdded": "2026-06-04T00:00:00Z",\r
      "x": 96.0,\r
      "y": 800.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "tags": [],\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "a6000000-0000-0000-0000-000000000031",\r
          "nodeId": "a5000000-0000-0000-0000-000000000003",\r
          "paramDefId": "a1000000-0000-0000-0000-000000000001",\r
          "value": "datastore",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "a6000000-0000-0000-0000-000000000032",\r
          "nodeId": "a5000000-0000-0000-0000-000000000003",\r
          "paramDefId": "a1000000-0000-0000-0000-000000000002",\r
          "value": "95",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        },\r
        {\r
          "id": "a6000000-0000-0000-0000-000000000033",\r
          "nodeId": "a5000000-0000-0000-0000-000000000003",\r
          "paramDefId": "a1000000-0000-0000-0000-000000000003",\r
          "value": "incident postmortem",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false,\r
      "zOrder": 0,\r
      "kind": "standard",\r
      "width": null,\r
      "height": null\r
    },\r
    {\r
      "id": "a5000000-0000-0000-0000-000000000004",\r
      "title": "Stripe",\r
      "description": "Third-party card processor. Billing API depends on it for captures; outages here surface as failed charges.",\r
      "eventDate": null,\r
      "dateAdded": "2026-06-04T00:00:00Z",\r
      "x": 1280.0,\r
      "y": 256.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "tags": [],\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "a6000000-0000-0000-0000-000000000041",\r
          "nodeId": "a5000000-0000-0000-0000-000000000004",\r
          "paramDefId": "a1000000-0000-0000-0000-000000000001",\r
          "value": "external",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false,\r
      "zOrder": 0,\r
      "kind": "standard",\r
      "width": null,\r
      "height": null\r
    },\r
    {\r
      "id": "a5000000-0000-0000-0000-000000000005",\r
      "title": "Priya (on-call)",\r
      "description": "Owns Auth Service. Paged for the Oct 3 checkout outage and led the mitigation.",\r
      "eventDate": null,\r
      "dateAdded": "2026-06-04T00:00:00Z",\r
      "x": 448.0,\r
      "y": 128.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "tags": [],\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "a6000000-0000-0000-0000-000000000051",\r
          "nodeId": "a5000000-0000-0000-0000-000000000005",\r
          "paramDefId": "a1000000-0000-0000-0000-000000000001",\r
          "value": "person",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "a6000000-0000-0000-0000-000000000053",\r
          "nodeId": "a5000000-0000-0000-0000-000000000005",\r
          "paramDefId": "a1000000-0000-0000-0000-000000000003",\r
          "value": "#incidents",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false,\r
      "zOrder": 0,\r
      "kind": "standard",\r
      "width": null,\r
      "height": null\r
    },\r
    {\r
      "id": "a5000000-0000-0000-0000-000000000006",\r
      "title": "Oct 3 checkout outage",\r
      "description": "Checkout failed for ~40 min. Traced to the user database exhausting its connection pool under load.",\r
      "eventDate": null,\r
      "dateAdded": "2026-06-04T00:00:00Z",\r
      "x": 96.0,\r
      "y": 1152.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "tags": [],\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "a6000000-0000-0000-0000-000000000061",\r
          "nodeId": "a5000000-0000-0000-0000-000000000006",\r
          "paramDefId": "a1000000-0000-0000-0000-000000000001",\r
          "value": "incident",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "a6000000-0000-0000-0000-000000000062",\r
          "nodeId": "a5000000-0000-0000-0000-000000000006",\r
          "paramDefId": "a1000000-0000-0000-0000-000000000002",\r
          "value": "90",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        },\r
        {\r
          "id": "a6000000-0000-0000-0000-000000000063",\r
          "nodeId": "a5000000-0000-0000-0000-000000000006",\r
          "paramDefId": "a1000000-0000-0000-0000-000000000003",\r
          "value": "incident postmortem",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false,\r
      "zOrder": 0,\r
      "kind": "standard",\r
      "width": null,\r
      "height": null\r
    },\r
    {\r
      "id": "a5000000-0000-0000-0000-000000000007",\r
      "title": "Add a read replica",\r
      "description": "Agreed mitigation: route read traffic to a replica so the primary stops being the bottleneck.",\r
      "eventDate": null,\r
      "dateAdded": "2026-06-04T00:00:00Z",\r
      "x": -320.0,\r
      "y": 896.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "tags": [],\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "a6000000-0000-0000-0000-000000000071",\r
          "nodeId": "a5000000-0000-0000-0000-000000000007",\r
          "paramDefId": "a1000000-0000-0000-0000-000000000001",\r
          "value": "decision",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "a6000000-0000-0000-0000-000000000072",\r
          "nodeId": "a5000000-0000-0000-0000-000000000007",\r
          "paramDefId": "a1000000-0000-0000-0000-000000000002",\r
          "value": "80",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        },\r
        {\r
          "id": "a6000000-0000-0000-0000-000000000073",\r
          "nodeId": "a5000000-0000-0000-0000-000000000007",\r
          "paramDefId": "a1000000-0000-0000-0000-000000000003",\r
          "value": "design review",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false,\r
      "zOrder": 0,\r
      "kind": "standard",\r
      "width": null,\r
      "height": null\r
    },\r
    {\r
      "id": "a8a8a8a8-0000-0000-0000-000000000001",\r
      "title": "About this demo",\r
      "description": "Note. This is an AI ops agent's MEMORY of a system, as a typed graph: services, a datastore, people, an incident, a decision, and how they connect. Right-click the user database and Trace upstream to see what breaks if it goes down. An agent reads and writes this over the API/MCP; you can see and correct it.",\r
      "eventDate": null,\r
      "dateAdded": "2026-06-04T00:00:00Z",\r
      "x": 832.0,\r
      "y": 768.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "tags": [],\r
      "links": [],\r
      "media": [],\r
      "paramValues": [],\r
      "isPinned": false,\r
      "isExpandPinned": false,\r
      "zOrder": 0,\r
      "kind": "note",\r
      "width": 300,\r
      "height": 170\r
    }\r
  ],\r
  "edges": [\r
    {\r
      "id": "ae000000-0000-0000-0000-000000000001",\r
      "sourceId": "a5000000-0000-0000-0000-000000000001",\r
      "targetId": "a5000000-0000-0000-0000-000000000002",\r
      "sourceHandle": "left",\r
      "targetHandle": "right",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "af000000-0000-0000-0000-000000000011",\r
          "edgeId": "ae000000-0000-0000-0000-000000000001",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000001",\r
          "value": "depends-on",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "af000000-0000-0000-0000-000000000012",\r
          "edgeId": "ae000000-0000-0000-0000-000000000001",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "af000000-0000-0000-0000-000000000013",\r
          "edgeId": "ae000000-0000-0000-0000-000000000001",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000003",\r
          "value": "3",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#5588bb"\r
    },\r
    {\r
      "id": "ae000000-0000-0000-0000-000000000002",\r
      "sourceId": "a5000000-0000-0000-0000-000000000001",\r
      "targetId": "a5000000-0000-0000-0000-000000000004",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "af000000-0000-0000-0000-000000000021",\r
          "edgeId": "ae000000-0000-0000-0000-000000000002",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000001",\r
          "value": "depends-on",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "af000000-0000-0000-0000-000000000022",\r
          "edgeId": "ae000000-0000-0000-0000-000000000002",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "af000000-0000-0000-0000-000000000023",\r
          "edgeId": "ae000000-0000-0000-0000-000000000002",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000003",\r
          "value": "2",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#5588bb"\r
    },\r
    {\r
      "id": "ae000000-0000-0000-0000-000000000003",\r
      "sourceId": "a5000000-0000-0000-0000-000000000002",\r
      "targetId": "a5000000-0000-0000-0000-000000000003",\r
      "sourceHandle": "left",\r
      "targetHandle": "right",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "af000000-0000-0000-0000-000000000031",\r
          "edgeId": "ae000000-0000-0000-0000-000000000003",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000001",\r
          "value": "depends-on",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "af000000-0000-0000-0000-000000000032",\r
          "edgeId": "ae000000-0000-0000-0000-000000000003",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "af000000-0000-0000-0000-000000000033",\r
          "edgeId": "ae000000-0000-0000-0000-000000000003",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000003",\r
          "value": "3",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#5588bb"\r
    },\r
    {\r
      "id": "ae000000-0000-0000-0000-000000000004",\r
      "sourceId": "a5000000-0000-0000-0000-000000000003",\r
      "targetId": "a5000000-0000-0000-0000-000000000006",\r
      "sourceHandle": "bottom",\r
      "targetHandle": "top",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "af000000-0000-0000-0000-000000000041",\r
          "edgeId": "ae000000-0000-0000-0000-000000000004",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000001",\r
          "value": "caused",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "af000000-0000-0000-0000-000000000042",\r
          "edgeId": "ae000000-0000-0000-0000-000000000004",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "af000000-0000-0000-0000-000000000043",\r
          "edgeId": "ae000000-0000-0000-0000-000000000004",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000003",\r
          "value": "3",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#c83030"\r
    },\r
    {\r
      "id": "ae000000-0000-0000-0000-000000000005",\r
      "sourceId": "a5000000-0000-0000-0000-000000000005",\r
      "targetId": "a5000000-0000-0000-0000-000000000002",\r
      "sourceHandle": "bottom",\r
      "targetHandle": "top",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "af000000-0000-0000-0000-000000000051",\r
          "edgeId": "ae000000-0000-0000-0000-000000000005",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000001",\r
          "value": "owns",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "af000000-0000-0000-0000-000000000052",\r
          "edgeId": "ae000000-0000-0000-0000-000000000005",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "af000000-0000-0000-0000-000000000053",\r
          "edgeId": "ae000000-0000-0000-0000-000000000005",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000003",\r
          "value": "2",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#d68b2a"\r
    },\r
    {\r
      "id": "ae000000-0000-0000-0000-000000000006",\r
      "sourceId": "a5000000-0000-0000-0000-000000000005",\r
      "targetId": "a5000000-0000-0000-0000-000000000006",\r
      "sourceHandle": "left",\r
      "targetHandle": "top",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "af000000-0000-0000-0000-000000000061",\r
          "edgeId": "ae000000-0000-0000-0000-000000000006",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000001",\r
          "value": "related",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "af000000-0000-0000-0000-000000000062",\r
          "edgeId": "ae000000-0000-0000-0000-000000000006",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "af000000-0000-0000-0000-000000000063",\r
          "edgeId": "ae000000-0000-0000-0000-000000000006",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000003",\r
          "value": "1",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#888888"\r
    },\r
    {\r
      "id": "ae000000-0000-0000-0000-000000000007",\r
      "sourceId": "a5000000-0000-0000-0000-000000000007",\r
      "targetId": "a5000000-0000-0000-0000-000000000003",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "af000000-0000-0000-0000-000000000071",\r
          "edgeId": "ae000000-0000-0000-0000-000000000007",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000001",\r
          "value": "mitigates",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "af000000-0000-0000-0000-000000000072",\r
          "edgeId": "ae000000-0000-0000-0000-000000000007",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "af000000-0000-0000-0000-000000000073",\r
          "edgeId": "ae000000-0000-0000-0000-000000000007",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000003",\r
          "value": "2",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#3d9e5f"\r
    },\r
    {\r
      "id": "ae000000-0000-0000-0000-000000000008",\r
      "sourceId": "a5000000-0000-0000-0000-000000000007",\r
      "targetId": "a5000000-0000-0000-0000-000000000006",\r
      "sourceHandle": "bottom",\r
      "targetHandle": "left",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "af000000-0000-0000-0000-000000000081",\r
          "edgeId": "ae000000-0000-0000-0000-000000000008",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000001",\r
          "value": "mitigates",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "af000000-0000-0000-0000-000000000082",\r
          "edgeId": "ae000000-0000-0000-0000-000000000008",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "af000000-0000-0000-0000-000000000083",\r
          "edgeId": "ae000000-0000-0000-0000-000000000008",\r
          "paramDefId": "a3000000-0000-0000-0000-000000000003",\r
          "value": "2",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#3d9e5f"\r
    }\r
  ],\r
  "regions": [\r
    {\r
      "id": "a7000000-0000-0000-0000-000000000001",\r
      "title": "Live system",\r
      "x": -32.0,\r
      "y": 160.0,\r
      "width": 1504.0,\r
      "height": 832.0,\r
      "color": "#5588bb",\r
      "createdAt": "2026-06-04T00:00:00Z"\r
    },\r
    {\r
      "id": "a7000000-0000-0000-0000-000000000002",\r
      "title": "What the agent observed",\r
      "x": -448.0,\r
      "y": 768.0,\r
      "width": 736.0,\r
      "height": 576.0,\r
      "color": "#c83030",\r
      "createdAt": "2026-06-04T00:00:00Z"\r
    }\r
  ]\r
}`,io=`{\r
  "version": 8,\r
  "exportedAt": "2026-06-01T01:58:55.722958200+00:00",\r
  "settings": {\r
    "presetName": "Macro Economics",\r
    "paramDefs": [\r
      {\r
        "id": "00000000-0000-0004-0000-000000000001",\r
        "presetId": "00000000-0000-0000-0000-000000000001",\r
        "displayName": "Domain",\r
        "paramType": "select_color",\r
        "defaultValue": null,\r
        "drivesColor": true,\r
        "showOnCardDefault": true,\r
        "sortOrder": 0,\r
        "options": [\r
          {\r
            "id": "00000000-0000-0005-0001-000000000001",\r
            "paramDefId": "00000000-0000-0004-0000-000000000001",\r
            "valueSlug": "political",\r
            "label": "Political",\r
            "color": "#388bfd",\r
            "sortOrder": 0\r
          },\r
          {\r
            "id": "00000000-0000-0005-0001-000000000002",\r
            "paramDefId": "00000000-0000-0004-0000-000000000001",\r
            "valueSlug": "economic",\r
            "label": "Economic",\r
            "color": "#3fb950",\r
            "sortOrder": 1\r
          },\r
          {\r
            "id": "00000000-0000-0005-0001-000000000003",\r
            "paramDefId": "00000000-0000-0004-0000-000000000001",\r
            "valueSlug": "natural",\r
            "label": "Natural",\r
            "color": "#d29922",\r
            "sortOrder": 2\r
          },\r
          {\r
            "id": "00000000-0000-0005-0001-000000000004",\r
            "paramDefId": "00000000-0000-0004-0000-000000000001",\r
            "valueSlug": "market",\r
            "label": "Financial",\r
            "color": "#bc8cff",\r
            "sortOrder": 3\r
          },\r
          {\r
            "id": "00000000-0000-0005-0001-000000000005",\r
            "paramDefId": "00000000-0000-0004-0000-000000000001",\r
            "valueSlug": "energy",\r
            "label": "Energy",\r
            "color": "#f78166",\r
            "sortOrder": 4\r
          },\r
          {\r
            "id": "00000000-0000-0005-0001-000000000006",\r
            "paramDefId": "00000000-0000-0004-0000-000000000001",\r
            "valueSlug": "social",\r
            "label": "Social",\r
            "color": "#f778ba",\r
            "sortOrder": 5\r
          },\r
          {\r
            "id": "00000000-0000-0005-0001-000000000008",\r
            "paramDefId": "00000000-0000-0004-0000-000000000001",\r
            "valueSlug": "policy",\r
            "label": "Policy",\r
            "color": "#e8c86e",\r
            "sortOrder": 6\r
          },\r
          {\r
            "id": "00000000-0000-0005-0001-000000000007",\r
            "paramDefId": "00000000-0000-0004-0000-000000000001",\r
            "valueSlug": "other",\r
            "label": "Other",\r
            "color": "#8b949e",\r
            "sortOrder": 7\r
          }\r
        ]\r
      },\r
      {\r
        "id": "00000000-0000-0004-0000-000000000002",\r
        "presetId": "00000000-0000-0000-0000-000000000001",\r
        "displayName": "Status",\r
        "paramType": "select_color",\r
        "defaultValue": null,\r
        "drivesColor": false,\r
        "showOnCardDefault": false,\r
        "sortOrder": 1,\r
        "options": [\r
          {\r
            "id": "00000000-0000-0005-0002-000000000001",\r
            "paramDefId": "00000000-0000-0004-0000-000000000002",\r
            "valueSlug": "confirmed",\r
            "label": "Confirmed",\r
            "color": "#3d9e5f",\r
            "sortOrder": 0\r
          },\r
          {\r
            "id": "00000000-0000-0005-0002-000000000002",\r
            "paramDefId": "00000000-0000-0004-0000-000000000002",\r
            "valueSlug": "expected",\r
            "label": "Expected",\r
            "color": "#d68b2a",\r
            "sortOrder": 1\r
          },\r
          {\r
            "id": "00000000-0000-0005-0002-000000000003",\r
            "paramDefId": "00000000-0000-0004-0000-000000000002",\r
            "valueSlug": "speculative",\r
            "label": "Speculative",\r
            "color": "#888888",\r
            "sortOrder": 2\r
          },\r
          {\r
            "id": "00000000-0000-0005-0002-000000000004",\r
            "paramDefId": "00000000-0000-0004-0000-000000000002",\r
            "valueSlug": "rejected",\r
            "label": "Rejected",\r
            "color": "#c83030",\r
            "sortOrder": 3\r
          }\r
        ]\r
      },\r
      {\r
        "id": "00000000-0000-0004-0001-000000000003",\r
        "presetId": "00000000-0000-0000-0000-000000000001",\r
        "displayName": "Region",\r
        "paramType": "select_color",\r
        "defaultValue": null,\r
        "drivesColor": false,\r
        "showOnCardDefault": false,\r
        "sortOrder": 2,\r
        "options": [\r
          {\r
            "id": "00000000-0000-0005-0003-000000000001",\r
            "paramDefId": "00000000-0000-0004-0001-000000000003",\r
            "valueSlug": "global",\r
            "label": "Global",\r
            "color": "#888888",\r
            "sortOrder": 0\r
          },\r
          {\r
            "id": "00000000-0000-0005-0003-000000000002",\r
            "paramDefId": "00000000-0000-0004-0001-000000000003",\r
            "valueSlug": "americas",\r
            "label": "Americas",\r
            "color": "#3fb950",\r
            "sortOrder": 1\r
          },\r
          {\r
            "id": "00000000-0000-0005-0003-000000000003",\r
            "paramDefId": "00000000-0000-0004-0001-000000000003",\r
            "valueSlug": "europe",\r
            "label": "Europe",\r
            "color": "#388bfd",\r
            "sortOrder": 2\r
          },\r
          {\r
            "id": "00000000-0000-0005-0003-000000000004",\r
            "paramDefId": "00000000-0000-0004-0001-000000000003",\r
            "valueSlug": "asia_pac",\r
            "label": "Asia-Pacific",\r
            "color": "#d68b2a",\r
            "sortOrder": 3\r
          },\r
          {\r
            "id": "00000000-0000-0005-0003-000000000005",\r
            "paramDefId": "00000000-0000-0004-0001-000000000003",\r
            "valueSlug": "mea",\r
            "label": "Middle East/Africa",\r
            "color": "#f78166",\r
            "sortOrder": 4\r
          },\r
          {\r
            "id": "00000000-0000-0005-0003-000000000006",\r
            "paramDefId": "00000000-0000-0004-0001-000000000003",\r
            "valueSlug": "em",\r
            "label": "Emerging Markets",\r
            "color": "#7766aa",\r
            "sortOrder": 5\r
          }\r
        ]\r
      }\r
    ],\r
    "edgeParamDefs": [\r
      {\r
        "id": "00000000-0000-0006-0001-000000000001",\r
        "presetId": "00000000-0000-0000-0000-000000000001",\r
        "displayName": "Causation",\r
        "paramType": "select_color",\r
        "defaultValue": null,\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": true,\r
        "drivesWidth": false,\r
        "sortOrder": 0,\r
        "options": [\r
          {\r
            "id": "00000000-0000-0007-0001-000000000001",\r
            "paramDefId": "00000000-0000-0006-0001-000000000001",\r
            "valueSlug": "caused_by",\r
            "label": "Caused By",\r
            "color": "#c83030",\r
            "sortOrder": 0\r
          },\r
          {\r
            "id": "00000000-0000-0007-0001-000000000002",\r
            "paramDefId": "00000000-0000-0006-0001-000000000001",\r
            "valueSlug": "correlated",\r
            "label": "Correlates With",\r
            "color": "#388bfd",\r
            "sortOrder": 1\r
          },\r
          {\r
            "id": "00000000-0000-0007-0001-000000000003",\r
            "paramDefId": "00000000-0000-0006-0001-000000000001",\r
            "valueSlug": "supports",\r
            "label": "Amplifies",\r
            "color": "#3d9e5f",\r
            "sortOrder": 2\r
          },\r
          {\r
            "id": "00000000-0000-0007-0001-000000000004",\r
            "paramDefId": "00000000-0000-0006-0001-000000000001",\r
            "valueSlug": "opposes",\r
            "label": "Offsets",\r
            "color": "#f78166",\r
            "sortOrder": 3\r
          },\r
          {\r
            "id": "00000000-0000-0007-0001-000000000005",\r
            "paramDefId": "00000000-0000-0006-0001-000000000001",\r
            "valueSlug": "hedge",\r
            "label": "Hedges Against",\r
            "color": "#d68b2a",\r
            "sortOrder": 4\r
          },\r
          {\r
            "id": "00000000-0000-0007-0001-000000000006",\r
            "paramDefId": "00000000-0000-0006-0001-000000000001",\r
            "valueSlug": "reaction",\r
            "label": "Reacts To",\r
            "color": "#7766aa",\r
            "sortOrder": 5\r
          },\r
          {\r
            "id": "00000000-0000-0007-0001-000000000007",\r
            "paramDefId": "00000000-0000-0006-0001-000000000001",\r
            "valueSlug": "preceded",\r
            "label": "Preceded By",\r
            "color": "#8b949e",\r
            "sortOrder": 6\r
          }\r
        ]\r
      },\r
      {\r
        "id": "00000000-0000-0006-0001-000000000002",\r
        "presetId": "00000000-0000-0000-0000-000000000001",\r
        "displayName": "Directed",\r
        "paramType": "boolean",\r
        "defaultValue": "true",\r
        "drivesArrow": true,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": false,\r
        "sortOrder": 1,\r
        "options": []\r
      },\r
      {\r
        "id": "00000000-0000-0006-0001-000000000003",\r
        "presetId": "00000000-0000-0000-0000-000000000001",\r
        "displayName": "Line Style",\r
        "paramType": "select",\r
        "defaultValue": null,\r
        "drivesArrow": false,\r
        "drivesStyle": true,\r
        "drivesColor": false,\r
        "drivesWidth": false,\r
        "sortOrder": 2,\r
        "options": [\r
          {\r
            "id": "00000000-0000-0007-0003-000000000001",\r
            "paramDefId": "00000000-0000-0006-0001-000000000003",\r
            "valueSlug": "default",\r
            "label": "Bezier (curved)",\r
            "color": null,\r
            "sortOrder": 0\r
          },\r
          {\r
            "id": "00000000-0000-0007-0003-000000000002",\r
            "paramDefId": "00000000-0000-0006-0001-000000000003",\r
            "valueSlug": "straight",\r
            "label": "Straight",\r
            "color": null,\r
            "sortOrder": 1\r
          },\r
          {\r
            "id": "00000000-0000-0007-0003-000000000003",\r
            "paramDefId": "00000000-0000-0006-0001-000000000003",\r
            "valueSlug": "step",\r
            "label": "Step",\r
            "color": null,\r
            "sortOrder": 2\r
          },\r
          {\r
            "id": "00000000-0000-0007-0003-000000000004",\r
            "paramDefId": "00000000-0000-0006-0001-000000000003",\r
            "valueSlug": "smoothstep",\r
            "label": "Smooth Step",\r
            "color": null,\r
            "sortOrder": 3\r
          }\r
        ]\r
      },\r
      {\r
        "id": "00000000-0000-0006-0001-000000000004",\r
        "presetId": "00000000-0000-0000-0000-000000000001",\r
        "displayName": "Strength",\r
        "paramType": "number",\r
        "defaultValue": "5",\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": true,\r
        "sortOrder": 3,\r
        "options": []\r
      },\r
      {\r
        "id": "00000000-0000-0006-0001-000000000005",\r
        "presetId": "00000000-0000-0000-0000-000000000001",\r
        "displayName": "Notes",\r
        "paramType": "text",\r
        "defaultValue": null,\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": false,\r
        "sortOrder": 4,\r
        "options": []\r
      },\r
      {\r
        "id": "00000000-0000-0006-0001-000000000006",\r
        "presetId": "00000000-0000-0000-0000-000000000001",\r
        "displayName": "Correlation",\r
        "paramType": "number",\r
        "defaultValue": null,\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": false,\r
        "sortOrder": 5,\r
        "options": []\r
      },\r
      {\r
        "id": "00000000-0000-0006-0001-000000000007",\r
        "presetId": "00000000-0000-0000-0000-000000000001",\r
        "displayName": "Time Lag (days)",\r
        "paramType": "number",\r
        "defaultValue": null,\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": false,\r
        "sortOrder": 6,\r
        "options": []\r
      },\r
      {\r
        "id": "00000000-0000-0006-0001-000000000008",\r
        "presetId": "00000000-0000-0000-0000-000000000001",\r
        "displayName": "Confidence (%)",\r
        "paramType": "number",\r
        "defaultValue": null,\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": false,\r
        "sortOrder": 7,\r
        "options": []\r
      }\r
    ]\r
  },\r
  "nodes": [\r
    {\r
      "id": "a5000000-0000-0000-0000-000000000001",\r
      "title": "Russia Invades Ukraine",\r
      "description": "Russia's full-scale invasion on Feb 24 2022 sent immediate shockwaves through global energy and food supply chains.",\r
      "eventDate": "2022-02-24",\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 160.0,\r
      "y": 352.0,\r
      "color": null,\r
      "confidence": 10,\r
      "impactMagnitude": 10,\r
      "externalId": null,\r
      "tags": [],\r
      "dataSource": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "64f93b48-efa3-455f-9ba8-1f02c8bed835",\r
          "nodeId": "a5000000-0000-0000-0000-000000000001",\r
          "paramDefId": "00000000-0000-0004-0000-000000000001",\r
          "value": "political",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "078c2cf5-9019-4d07-a96f-e5a18a65ca3f",\r
          "nodeId": "a5000000-0000-0000-0000-000000000001",\r
          "paramDefId": "00000000-0000-0004-0000-000000000002",\r
          "value": "confirmed",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false\r
    },\r
    {\r
      "id": "a5000000-0000-0000-0000-000000000002",\r
      "title": "Global Energy Price Spike",\r
      "description": "Brent crude surged past $130/bbl in March 2022 as Russian supply was cut off. Europe's gas prices hit record highs.",\r
      "eventDate": "2022-03-08",\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 640.0,\r
      "y": 128.0,\r
      "color": null,\r
      "confidence": 10,\r
      "impactMagnitude": 9,\r
      "externalId": null,\r
      "tags": [],\r
      "dataSource": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "8015afe5-05aa-42f7-9e6e-5f1c283eae0d",\r
          "nodeId": "a5000000-0000-0000-0000-000000000002",\r
          "paramDefId": "00000000-0000-0004-0000-000000000001",\r
          "value": "energy",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "381d7d4f-ea59-4b84-aa49-2b00185008fe",\r
          "nodeId": "a5000000-0000-0000-0000-000000000002",\r
          "paramDefId": "00000000-0000-0004-0000-000000000002",\r
          "value": "confirmed",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false\r
    },\r
    {\r
      "id": "a5000000-0000-0000-0000-000000000003",\r
      "title": "Food Supply Shock",\r
      "description": "Ukraine and Russia supply 30% of global wheat. Black Sea port blockades sent food prices up 30% in weeks.",\r
      "eventDate": "2022-03-15",\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 640.0,\r
      "y": 608.0,\r
      "color": null,\r
      "confidence": 9,\r
      "impactMagnitude": 8,\r
      "externalId": null,\r
      "tags": [],\r
      "dataSource": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "309f1616-288c-48bc-8e12-b00294b01d51",\r
          "nodeId": "a5000000-0000-0000-0000-000000000003",\r
          "paramDefId": "00000000-0000-0004-0000-000000000001",\r
          "value": "economic",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "7e27c4e9-d22e-4ca4-b436-9e26e993f112",\r
          "nodeId": "a5000000-0000-0000-0000-000000000003",\r
          "paramDefId": "00000000-0000-0004-0000-000000000002",\r
          "value": "confirmed",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false\r
    },\r
    {\r
      "id": "a5000000-0000-0000-0000-000000000004",\r
      "title": "US CPI Peaks at 9.1%",\r
      "description": "June 2022 — the highest US inflation reading since 1981. Supply shock collided with post-pandemic demand surge.",\r
      "eventDate": "2022-06-10",\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 1120.0,\r
      "y": 352.0,\r
      "color": null,\r
      "confidence": 10,\r
      "impactMagnitude": 9,\r
      "externalId": null,\r
      "tags": [],\r
      "dataSource": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "b77f1340-64b4-4a11-9469-5bb17ad1423b",\r
          "nodeId": "a5000000-0000-0000-0000-000000000004",\r
          "paramDefId": "00000000-0000-0004-0000-000000000001",\r
          "value": "economic",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "8910e310-09ea-407a-b3c7-41f3f2e2ad7e",\r
          "nodeId": "a5000000-0000-0000-0000-000000000004",\r
          "paramDefId": "00000000-0000-0004-0000-000000000002",\r
          "value": "confirmed",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false\r
    },\r
    {\r
      "id": "a5000000-0000-0000-0000-000000000005",\r
      "title": "Fed Rate Hike Cycle",\r
      "description": "Five consecutive 75bps hikes through 2022 — the most aggressive Fed tightening since Volcker in the 1980s.",\r
      "eventDate": "2022-06-15",\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 1600.0,\r
      "y": 128.0,\r
      "color": null,\r
      "confidence": 10,\r
      "impactMagnitude": 10,\r
      "externalId": null,\r
      "tags": [],\r
      "dataSource": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "542d3981-3ff8-481d-bf93-8f6adb116975",\r
          "nodeId": "a5000000-0000-0000-0000-000000000005",\r
          "paramDefId": "00000000-0000-0004-0000-000000000001",\r
          "value": "policy",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "fea9c7fa-19a8-451d-bdad-3a81d4d58e60",\r
          "nodeId": "a5000000-0000-0000-0000-000000000005",\r
          "paramDefId": "00000000-0000-0004-0000-000000000002",\r
          "value": "confirmed",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false\r
    },\r
    {\r
      "id": "a5000000-0000-0000-0000-000000000006",\r
      "title": "USD Hits 20-Year High",\r
      "description": "DXY surged to 114 in September 2022 as US rates diverged sharply from the rest of the world.",\r
      "eventDate": "2022-09-28",\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 1600.0,\r
      "y": 576.0,\r
      "color": null,\r
      "confidence": 10,\r
      "impactMagnitude": 8,\r
      "externalId": null,\r
      "tags": [],\r
      "dataSource": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "a26c903e-672b-40b4-81d1-0dd8afee0949",\r
          "nodeId": "a5000000-0000-0000-0000-000000000006",\r
          "paramDefId": "00000000-0000-0004-0000-000000000001",\r
          "value": "market",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "ba99d6d0-df3f-42f7-92f4-a5820108b600",\r
          "nodeId": "a5000000-0000-0000-0000-000000000006",\r
          "paramDefId": "00000000-0000-0004-0000-000000000002",\r
          "value": "confirmed",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false\r
    },\r
    {\r
      "id": "a5000000-0000-0000-0000-000000000007",\r
      "title": "Emerging Market Stress",\r
      "description": "Strong dollar crushed EM economies — Sri Lanka defaulted, Pakistan sought IMF bailout, Egypt devalued 50%.",\r
      "eventDate": "2022-10-01",\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 2080.0,\r
      "y": 352.0,\r
      "color": null,\r
      "confidence": 9,\r
      "impactMagnitude": 7,\r
      "externalId": null,\r
      "tags": [],\r
      "dataSource": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "14c7a311-deec-417b-97e5-b9246c3249e0",\r
          "nodeId": "a5000000-0000-0000-0000-000000000007",\r
          "paramDefId": "00000000-0000-0004-0000-000000000001",\r
          "value": "market",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "350b372b-1c25-4c16-8f79-22f9e33b7146",\r
          "nodeId": "a5000000-0000-0000-0000-000000000007",\r
          "paramDefId": "00000000-0000-0004-0000-000000000002",\r
          "value": "confirmed",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        },\r
        {\r
          "id": "0dfd8a5f-8b55-4169-b969-55c6ad6816c6",\r
          "nodeId": "a5000000-0000-0000-0000-000000000007",\r
          "paramDefId": "00000000-0000-0004-0001-000000000003",\r
          "value": "em",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false\r
    },\r
    {\r
      "id": "0391be49-4a28-4283-9915-4a7a0444a612",\r
      "title": "About this demo",\r
      "description": "This is a Note — one of GloGraph's graph objects (alongside image, video, and audio). This map traces the 2022–2023 macro crisis: rate hikes, energy shocks, and market stress. Click to edit a note inline, drag its corner to resize, and connect it like any object.",\r
      "eventDate": null,\r
      "dateAdded": "2026-06-02T00:00:00Z",\r
      "x": 160.0,\r
      "y": -192.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "tags": [],\r
      "links": [],\r
      "media": [],\r
      "paramValues": [],\r
      "isPinned": false,\r
      "isExpandPinned": false,\r
      "zOrder": 0,\r
      "kind": "note",\r
      "width": 280,\r
      "height": 150\r
    }\r
  ],\r
  "edges": [\r
    {\r
      "id": "ae000000-0000-0000-0000-000000000001",\r
      "sourceId": "a5000000-0000-0000-0000-000000000001",\r
      "targetId": "a5000000-0000-0000-0000-000000000002",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "paramValues": [\r
        {\r
          "id": "6042db83-7047-4664-9fef-2ceaa8d69d66",\r
          "edgeId": "ae000000-0000-0000-0000-000000000001",\r
          "paramDefId": "00000000-0000-0006-0001-000000000001",\r
          "value": "caused_by",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "19a02a14-fe53-4a14-8138-c7e9ed271d0c",\r
          "edgeId": "ae000000-0000-0000-0000-000000000001",\r
          "paramDefId": "00000000-0000-0006-0001-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "acefdfad-0d22-4248-b6a0-a8c42c9e1db0",\r
          "edgeId": "ae000000-0000-0000-0000-000000000001",\r
          "paramDefId": "00000000-0000-0006-0001-000000000004",\r
          "value": "8",\r
          "isEnabled": true\r
        }\r
      ],\r
      "waypoints": null,\r
      "externalId": null,\r
      "label": null,\r
      "color": "#c83030"\r
    },\r
    {\r
      "id": "ae000000-0000-0000-0000-000000000002",\r
      "sourceId": "a5000000-0000-0000-0000-000000000001",\r
      "targetId": "a5000000-0000-0000-0000-000000000003",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "paramValues": [\r
        {\r
          "id": "82385bba-bf1f-4141-9b99-a9156fbbf18e",\r
          "edgeId": "ae000000-0000-0000-0000-000000000002",\r
          "paramDefId": "00000000-0000-0006-0001-000000000001",\r
          "value": "caused_by",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "4036e0c8-7034-4e43-8748-595f720c5eb7",\r
          "edgeId": "ae000000-0000-0000-0000-000000000002",\r
          "paramDefId": "00000000-0000-0006-0001-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "b7a269ab-7207-41a7-bb45-685449cfca36",\r
          "edgeId": "ae000000-0000-0000-0000-000000000002",\r
          "paramDefId": "00000000-0000-0006-0001-000000000004",\r
          "value": "7",\r
          "isEnabled": true\r
        }\r
      ],\r
      "waypoints": null,\r
      "externalId": null,\r
      "label": null,\r
      "color": "#c83030"\r
    },\r
    {\r
      "id": "ae000000-0000-0000-0000-000000000003",\r
      "sourceId": "a5000000-0000-0000-0000-000000000002",\r
      "targetId": "a5000000-0000-0000-0000-000000000004",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "paramValues": [\r
        {\r
          "id": "b84f45de-0ae6-4f76-92d0-9e7a4aaea335",\r
          "edgeId": "ae000000-0000-0000-0000-000000000003",\r
          "paramDefId": "00000000-0000-0006-0001-000000000001",\r
          "value": "supports",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "be6ac3ae-5b34-4dd9-8599-1ad7c4a0a86d",\r
          "edgeId": "ae000000-0000-0000-0000-000000000003",\r
          "paramDefId": "00000000-0000-0006-0001-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "5c0572e0-f865-42ef-804d-6010141cca78",\r
          "edgeId": "ae000000-0000-0000-0000-000000000003",\r
          "paramDefId": "00000000-0000-0006-0001-000000000004",\r
          "value": "8",\r
          "isEnabled": true\r
        }\r
      ],\r
      "waypoints": null,\r
      "externalId": null,\r
      "label": null,\r
      "color": "#3d9e5f"\r
    },\r
    {\r
      "id": "ae000000-0000-0000-0000-000000000004",\r
      "sourceId": "a5000000-0000-0000-0000-000000000003",\r
      "targetId": "a5000000-0000-0000-0000-000000000004",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "paramValues": [\r
        {\r
          "id": "9d6706f1-cf69-48fe-b71b-b2ceecae4619",\r
          "edgeId": "ae000000-0000-0000-0000-000000000004",\r
          "paramDefId": "00000000-0000-0006-0001-000000000001",\r
          "value": "supports",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "2992435e-e267-407a-8500-3f0d1e0daf73",\r
          "edgeId": "ae000000-0000-0000-0000-000000000004",\r
          "paramDefId": "00000000-0000-0006-0001-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "382d7581-dc1a-4d83-9f1c-619c6fb2071b",\r
          "edgeId": "ae000000-0000-0000-0000-000000000004",\r
          "paramDefId": "00000000-0000-0006-0001-000000000004",\r
          "value": "6",\r
          "isEnabled": true\r
        }\r
      ],\r
      "waypoints": null,\r
      "externalId": null,\r
      "label": null,\r
      "color": "#3d9e5f"\r
    },\r
    {\r
      "id": "ae000000-0000-0000-0000-000000000005",\r
      "sourceId": "a5000000-0000-0000-0000-000000000004",\r
      "targetId": "a5000000-0000-0000-0000-000000000005",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "paramValues": [\r
        {\r
          "id": "7350bfb0-6574-46f8-bfa7-aa9329942a29",\r
          "edgeId": "ae000000-0000-0000-0000-000000000005",\r
          "paramDefId": "00000000-0000-0006-0001-000000000001",\r
          "value": "caused_by",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "98a4a88e-1cc0-42fd-84d0-acbdda3a52a2",\r
          "edgeId": "ae000000-0000-0000-0000-000000000005",\r
          "paramDefId": "00000000-0000-0006-0001-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "df0948ad-d1bf-4fa3-ab2e-63884b84544d",\r
          "edgeId": "ae000000-0000-0000-0000-000000000005",\r
          "paramDefId": "00000000-0000-0006-0001-000000000004",\r
          "value": "9",\r
          "isEnabled": true\r
        }\r
      ],\r
      "waypoints": null,\r
      "externalId": null,\r
      "label": null,\r
      "color": "#c83030"\r
    },\r
    {\r
      "id": "ae000000-0000-0000-0000-000000000006",\r
      "sourceId": "a5000000-0000-0000-0000-000000000005",\r
      "targetId": "a5000000-0000-0000-0000-000000000006",\r
      "sourceHandle": "bottom",\r
      "targetHandle": "top",\r
      "paramValues": [\r
        {\r
          "id": "6941a7f7-e1e5-4764-8d48-45f2c213e8ec",\r
          "edgeId": "ae000000-0000-0000-0000-000000000006",\r
          "paramDefId": "00000000-0000-0006-0001-000000000001",\r
          "value": "caused_by",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "4ab1161e-9965-473e-8149-b0c5a0f50786",\r
          "edgeId": "ae000000-0000-0000-0000-000000000006",\r
          "paramDefId": "00000000-0000-0006-0001-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "71681a4d-28c9-4c97-8ba2-722cd67802ee",\r
          "edgeId": "ae000000-0000-0000-0000-000000000006",\r
          "paramDefId": "00000000-0000-0006-0001-000000000004",\r
          "value": "7",\r
          "isEnabled": true\r
        }\r
      ],\r
      "waypoints": null,\r
      "externalId": null,\r
      "label": null,\r
      "color": "#c83030"\r
    },\r
    {\r
      "id": "ae000000-0000-0000-0000-000000000007",\r
      "sourceId": "a5000000-0000-0000-0000-000000000006",\r
      "targetId": "a5000000-0000-0000-0000-000000000007",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "paramValues": [\r
        {\r
          "id": "08e8043d-affa-437b-9130-4094bdd2330b",\r
          "edgeId": "ae000000-0000-0000-0000-000000000007",\r
          "paramDefId": "00000000-0000-0006-0001-000000000001",\r
          "value": "caused_by",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "94032686-83e6-430b-bd30-f417770f33a4",\r
          "edgeId": "ae000000-0000-0000-0000-000000000007",\r
          "paramDefId": "00000000-0000-0006-0001-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "b221f867-16f4-43a8-ad3c-d157b51ede30",\r
          "edgeId": "ae000000-0000-0000-0000-000000000007",\r
          "paramDefId": "00000000-0000-0006-0001-000000000004",\r
          "value": "6",\r
          "isEnabled": true\r
        }\r
      ],\r
      "waypoints": null,\r
      "externalId": null,\r
      "label": null,\r
      "color": "#c83030"\r
    }\r
  ],\r
  "regions": [\r
    {\r
      "id": "a7000000-0000-0000-0000-000000000001",\r
      "title": "Supply Shock",\r
      "x": 137.6,\r
      "y": 36.8,\r
      "width": 800.0,\r
      "height": 704.0,\r
      "color": "#f78166",\r
      "zOrder": 0,\r
      "isLocked": true,\r
      "isMinimized": false,\r
      "createdAt": "2026-06-01T01:20:55.580847200+00:00"\r
    },\r
    {\r
      "id": "a7000000-0000-0000-0000-000000000002",\r
      "title": "Policy Response",\r
      "x": 1520.0,\r
      "y": 48.0,\r
      "width": 464.0,\r
      "height": 704.0,\r
      "color": "#e8c86e",\r
      "zOrder": 0,\r
      "isLocked": true,\r
      "isMinimized": false,\r
      "createdAt": "2026-06-01T01:20:55.580847200+00:00"\r
    }\r
  ],\r
  "bookmarks": null,\r
  "graphNotes": null\r
}`,lo=`{\r
  "version": 8,\r
  "exportedAt": "2026-05-25T00:00:00Z",\r
  "settings": {\r
    "presetName": "System Behavior",\r
    "paramDefs": [\r
      {\r
        "id": "b1000000-0000-0000-0000-000000000001",\r
        "presetId": "b0000000-0000-0000-0000-000000000001",\r
        "displayName": "Element Type",\r
        "paramType": "select_color",\r
        "defaultValue": null,\r
        "drivesColor": true,\r
        "showOnCardDefault": true,\r
        "sortOrder": 0,\r
        "options": [\r
          {\r
            "id": "b2000000-0000-0000-0000-000000000001",\r
            "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
            "valueSlug": "process",\r
            "label": "Auxiliary",\r
            "color": "#5588bb",\r
            "sortOrder": 0\r
          },\r
          {\r
            "id": "b2000000-0000-0000-0000-000000000002",\r
            "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
            "valueSlug": "store",\r
            "label": "Stock",\r
            "color": "#3d9e5f",\r
            "sortOrder": 1\r
          },\r
          {\r
            "id": "b2000000-0000-0000-0000-000000000003",\r
            "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
            "valueSlug": "flow",\r
            "label": "Flow",\r
            "color": "#00b0c8",\r
            "sortOrder": 2\r
          },\r
          {\r
            "id": "b2000000-0000-0000-0000-000000000004",\r
            "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
            "valueSlug": "source",\r
            "label": "Source",\r
            "color": "#d68b2a",\r
            "sortOrder": 3\r
          },\r
          {\r
            "id": "b2000000-0000-0000-0000-000000000005",\r
            "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
            "valueSlug": "sink",\r
            "label": "Sink",\r
            "color": "#c83030",\r
            "sortOrder": 4\r
          },\r
          {\r
            "id": "b2000000-0000-0000-0000-000000000006",\r
            "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
            "valueSlug": "control",\r
            "label": "Parameter",\r
            "color": "#7766aa",\r
            "sortOrder": 5\r
          }\r
        ]\r
      },\r
      {\r
        "id": "b1000000-0000-0000-0000-000000000002",\r
        "presetId": "b0000000-0000-0000-0000-000000000001",\r
        "displayName": "Status",\r
        "paramType": "select_color",\r
        "defaultValue": null,\r
        "drivesColor": false,\r
        "showOnCardDefault": false,\r
        "sortOrder": 1,\r
        "options": [\r
          {\r
            "id": "b2000000-0000-0000-0000-000000000011",\r
            "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
            "valueSlug": "active",\r
            "label": "Active",\r
            "color": "#3d9e5f",\r
            "sortOrder": 0\r
          },\r
          {\r
            "id": "b2000000-0000-0000-0000-000000000012",\r
            "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
            "valueSlug": "oscillating",\r
            "label": "Oscillating",\r
            "color": "#d68b2a",\r
            "sortOrder": 1\r
          },\r
          {\r
            "id": "b2000000-0000-0000-0000-000000000013",\r
            "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
            "valueSlug": "saturated",\r
            "label": "Saturated",\r
            "color": "#f78166",\r
            "sortOrder": 2\r
          },\r
          {\r
            "id": "b2000000-0000-0000-0000-000000000014",\r
            "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
            "valueSlug": "dormant",\r
            "label": "Dormant",\r
            "color": "#888888",\r
            "sortOrder": 3\r
          },\r
          {\r
            "id": "b2000000-0000-0000-0000-000000000015",\r
            "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
            "valueSlug": "failed",\r
            "label": "Collapsed",\r
            "color": "#c83030",\r
            "sortOrder": 4\r
          }\r
        ]\r
      }\r
    ],\r
    "edgeParamDefs": [\r
      {\r
        "id": "b3000000-0000-0000-0000-000000000001",\r
        "presetId": "b0000000-0000-0000-0000-000000000001",\r
        "displayName": "Polarity",\r
        "paramType": "select_color",\r
        "defaultValue": null,\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": true,\r
        "drivesWidth": false,\r
        "sortOrder": 0,\r
        "options": [\r
          {\r
            "id": "b4000000-0000-0000-0000-000000000001",\r
            "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
            "valueSlug": "positive",\r
            "label": "Positive (+)",\r
            "color": "#3d9e5f",\r
            "sortOrder": 0\r
          },\r
          {\r
            "id": "b4000000-0000-0000-0000-000000000002",\r
            "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
            "valueSlug": "negative",\r
            "label": "Negative (−)",\r
            "color": "#c83030",\r
            "sortOrder": 1\r
          },\r
          {\r
            "id": "b4000000-0000-0000-0000-000000000003",\r
            "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
            "valueSlug": "neutral",\r
            "label": "Neutral",\r
            "color": "#888888",\r
            "sortOrder": 2\r
          }\r
        ]\r
      },\r
      {\r
        "id": "b3000000-0000-0000-0000-000000000002",\r
        "presetId": "b0000000-0000-0000-0000-000000000001",\r
        "displayName": "Loop Type",\r
        "paramType": "select_color",\r
        "defaultValue": null,\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": false,\r
        "sortOrder": 1,\r
        "options": [\r
          {\r
            "id": "b4000000-0000-0000-0000-000000000011",\r
            "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
            "valueSlug": "reinforcing",\r
            "label": "Reinforcing (R)",\r
            "color": "#d68b2a",\r
            "sortOrder": 0\r
          },\r
          {\r
            "id": "b4000000-0000-0000-0000-000000000012",\r
            "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
            "valueSlug": "balancing",\r
            "label": "Balancing (B)",\r
            "color": "#388bfd",\r
            "sortOrder": 1\r
          }\r
        ]\r
      },\r
      {\r
        "id": "b3000000-0000-0000-0000-000000000003",\r
        "presetId": "b0000000-0000-0000-0000-000000000001",\r
        "displayName": "Delayed",\r
        "paramType": "boolean",\r
        "defaultValue": "false",\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": false,\r
        "sortOrder": 2,\r
        "options": []\r
      },\r
      {\r
        "id": "b3000000-0000-0000-0000-000000000004",\r
        "presetId": "b0000000-0000-0000-0000-000000000001",\r
        "displayName": "Directed",\r
        "paramType": "boolean",\r
        "defaultValue": "true",\r
        "drivesArrow": true,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": false,\r
        "sortOrder": 3,\r
        "options": []\r
      },\r
      {\r
        "id": "b3000000-0000-0000-0000-000000000005",\r
        "presetId": "b0000000-0000-0000-0000-000000000001",\r
        "displayName": "Line Style",\r
        "paramType": "select",\r
        "defaultValue": null,\r
        "drivesArrow": false,\r
        "drivesStyle": true,\r
        "drivesColor": false,\r
        "drivesWidth": false,\r
        "sortOrder": 4,\r
        "options": [\r
          {\r
            "id": "b4000000-0000-0000-0000-000000000021",\r
            "paramDefId": "b3000000-0000-0000-0000-000000000005",\r
            "valueSlug": "default",\r
            "label": "Bezier (curved)",\r
            "color": null,\r
            "sortOrder": 0\r
          },\r
          {\r
            "id": "b4000000-0000-0000-0000-000000000022",\r
            "paramDefId": "b3000000-0000-0000-0000-000000000005",\r
            "valueSlug": "straight",\r
            "label": "Straight",\r
            "color": null,\r
            "sortOrder": 1\r
          },\r
          {\r
            "id": "b4000000-0000-0000-0000-000000000023",\r
            "paramDefId": "b3000000-0000-0000-0000-000000000005",\r
            "valueSlug": "step",\r
            "label": "Step",\r
            "color": null,\r
            "sortOrder": 2\r
          },\r
          {\r
            "id": "b4000000-0000-0000-0000-000000000024",\r
            "paramDefId": "b3000000-0000-0000-0000-000000000005",\r
            "valueSlug": "smoothstep",\r
            "label": "Smooth Step",\r
            "color": null,\r
            "sortOrder": 3\r
          }\r
        ]\r
      },\r
      {\r
        "id": "b3000000-0000-0000-0000-000000000006",\r
        "presetId": "b0000000-0000-0000-0000-000000000001",\r
        "displayName": "Strength",\r
        "paramType": "number",\r
        "defaultValue": "3",\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": true,\r
        "sortOrder": 5,\r
        "options": []\r
      },\r
      {\r
        "id": "b3000000-0000-0000-0000-000000000007",\r
        "presetId": "b0000000-0000-0000-0000-000000000001",\r
        "displayName": "Notes",\r
        "paramType": "text",\r
        "defaultValue": null,\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": false,\r
        "sortOrder": 6,\r
        "options": []\r
      }\r
    ]\r
  },\r
  "nodes": [\r
    {\r
      "id": "b5000000-0000-0000-0000-000000000001",\r
      "title": "Word of Mouth",\r
      "description": "Users recommend the app when it genuinely improves their life. The cheapest form of growth — and the only kind that compounds.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 576.0,\r
      "y": 160.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "b6000000-0000-0000-0000-000000000001",\r
          "nodeId": "b5000000-0000-0000-0000-000000000001",\r
          "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
          "value": "process",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "b6000000-0000-0000-0000-000000000002",\r
          "nodeId": "b5000000-0000-0000-0000-000000000001",\r
          "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
          "value": "active",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ]\r
    },\r
    {\r
      "id": "b5000000-0000-0000-0000-000000000002",\r
      "title": "New Signups",\r
      "description": "Rate of new users joining per week. Driven by referrals, ads, and organic discovery. This flow fills the Active Users stock.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 160.0,\r
      "y": 448.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "b6000000-0000-0000-0000-000000000003",\r
          "nodeId": "b5000000-0000-0000-0000-000000000002",\r
          "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
          "value": "flow",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "b6000000-0000-0000-0000-000000000004",\r
          "nodeId": "b5000000-0000-0000-0000-000000000002",\r
          "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
          "value": "active",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ]\r
    },\r
    {\r
      "id": "b5000000-0000-0000-0000-000000000003",\r
      "title": "Active Users",\r
      "description": "The core stock — how many people use the app regularly. Everything else flows into or drains out of this number.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 896.0,\r
      "y": 448.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "b6000000-0000-0000-0000-000000000005",\r
          "nodeId": "b5000000-0000-0000-0000-000000000003",\r
          "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
          "value": "store",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "b6000000-0000-0000-0000-000000000006",\r
          "nodeId": "b5000000-0000-0000-0000-000000000003",\r
          "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
          "value": "active",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ]\r
    },\r
    {\r
      "id": "b5000000-0000-0000-0000-000000000004",\r
      "title": "Network Effect",\r
      "description": "The app becomes more valuable as more people use it. A classic two-sided dynamic: more users → more useful → more users.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 1200.0,\r
      "y": 160.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "b6000000-0000-0000-0000-000000000007",\r
          "nodeId": "b5000000-0000-0000-0000-000000000004",\r
          "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
          "value": "process",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "b6000000-0000-0000-0000-000000000008",\r
          "nodeId": "b5000000-0000-0000-0000-000000000004",\r
          "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
          "value": "active",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ]\r
    },\r
    {\r
      "id": "b5000000-0000-0000-0000-000000000005",\r
      "title": "Churn",\r
      "description": "Users who leave each week. Higher when the app stops being useful, a bug frustrates them, or a competitor does it better.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 1408.0,\r
      "y": 448.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "b6000000-0000-0000-0000-000000000009",\r
          "nodeId": "b5000000-0000-0000-0000-000000000005",\r
          "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
          "value": "flow",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "b6000000-0000-0000-0000-000000000010",\r
          "nodeId": "b5000000-0000-0000-0000-000000000005",\r
          "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
          "value": "oscillating",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ]\r
    },\r
    {\r
      "id": "b5000000-0000-0000-0000-000000000006",\r
      "title": "Product Quality",\r
      "description": "How well the app solves a real problem. The only durable long-term input to growth — everything else is borrowed time.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 160.0,\r
      "y": 768.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "b6000000-0000-0000-0000-000000000011",\r
          "nodeId": "b5000000-0000-0000-0000-000000000006",\r
          "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
          "value": "control",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "b6000000-0000-0000-0000-000000000012",\r
          "nodeId": "b5000000-0000-0000-0000-000000000006",\r
          "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
          "value": "active",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ]\r
    },\r
    {\r
      "id": "b5000000-0000-0000-0000-000000000007",\r
      "title": "Competition",\r
      "description": "Rival apps applying constant upward pressure on churn. The balancing force in any market — there is always an alternative.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 1408.0,\r
      "y": 768.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "b6000000-0000-0000-0000-000000000013",\r
          "nodeId": "b5000000-0000-0000-0000-000000000007",\r
          "paramDefId": "b1000000-0000-0000-0000-000000000001",\r
          "value": "control",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "b6000000-0000-0000-0000-000000000014",\r
          "nodeId": "b5000000-0000-0000-0000-000000000007",\r
          "paramDefId": "b1000000-0000-0000-0000-000000000002",\r
          "value": "active",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ]\r
    },\r
    {\r
      "id": "adec5162-2370-4ce4-b0d3-b48d17f5f3c0",\r
      "title": "About this demo",\r
      "description": "Note (a graph object). This model shows reinforcing and balancing feedback loops behind product growth and churn. Use notes to annotate a diagram without making them typed nodes.",\r
      "eventDate": null,\r
      "dateAdded": "2026-06-02T00:00:00Z",\r
      "x": 160.0,\r
      "y": -160.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "tags": [],\r
      "links": [],\r
      "media": [],\r
      "paramValues": [],\r
      "isPinned": false,\r
      "isExpandPinned": false,\r
      "zOrder": 0,\r
      "kind": "note",\r
      "width": 280,\r
      "height": 150\r
    }\r
  ],\r
  "edges": [\r
    {\r
      "id": "be000000-0000-0000-0000-000000000001",\r
      "sourceId": "b5000000-0000-0000-0000-000000000001",\r
      "targetId": "b5000000-0000-0000-0000-000000000002",\r
      "sourceHandle": "left",\r
      "targetHandle": "right",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000001",\r
          "edgeId": "be000000-0000-0000-0000-000000000001",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
          "value": "positive",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000002",\r
          "edgeId": "be000000-0000-0000-0000-000000000001",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
          "value": "reinforcing",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000003",\r
          "edgeId": "be000000-0000-0000-0000-000000000001",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000004",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000004",\r
          "edgeId": "be000000-0000-0000-0000-000000000001",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000006",\r
          "value": "5",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#3d9e5f"\r
    },\r
    {\r
      "id": "be000000-0000-0000-0000-000000000002",\r
      "sourceId": "b5000000-0000-0000-0000-000000000002",\r
      "targetId": "b5000000-0000-0000-0000-000000000003",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000005",\r
          "edgeId": "be000000-0000-0000-0000-000000000002",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
          "value": "positive",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000006",\r
          "edgeId": "be000000-0000-0000-0000-000000000002",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
          "value": "reinforcing",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000007",\r
          "edgeId": "be000000-0000-0000-0000-000000000002",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000004",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000008",\r
          "edgeId": "be000000-0000-0000-0000-000000000002",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000006",\r
          "value": "5",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#3d9e5f"\r
    },\r
    {\r
      "id": "be000000-0000-0000-0000-000000000003",\r
      "sourceId": "b5000000-0000-0000-0000-000000000003",\r
      "targetId": "b5000000-0000-0000-0000-000000000004",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000009",\r
          "edgeId": "be000000-0000-0000-0000-000000000003",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
          "value": "positive",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000010",\r
          "edgeId": "be000000-0000-0000-0000-000000000003",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
          "value": "reinforcing",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000011",\r
          "edgeId": "be000000-0000-0000-0000-000000000003",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000004",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000012",\r
          "edgeId": "be000000-0000-0000-0000-000000000003",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000006",\r
          "value": "4",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#3d9e5f"\r
    },\r
    {\r
      "id": "be000000-0000-0000-0000-000000000004",\r
      "sourceId": "b5000000-0000-0000-0000-000000000004",\r
      "targetId": "b5000000-0000-0000-0000-000000000001",\r
      "sourceHandle": "left",\r
      "targetHandle": "right",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000013",\r
          "edgeId": "be000000-0000-0000-0000-000000000004",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
          "value": "positive",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000014",\r
          "edgeId": "be000000-0000-0000-0000-000000000004",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
          "value": "reinforcing",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000015",\r
          "edgeId": "be000000-0000-0000-0000-000000000004",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000004",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000016",\r
          "edgeId": "be000000-0000-0000-0000-000000000004",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000006",\r
          "value": "4",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#3d9e5f"\r
    },\r
    {\r
      "id": "be000000-0000-0000-0000-000000000005",\r
      "sourceId": "b5000000-0000-0000-0000-000000000003",\r
      "targetId": "b5000000-0000-0000-0000-000000000005",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000017",\r
          "edgeId": "be000000-0000-0000-0000-000000000005",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
          "value": "positive",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000018",\r
          "edgeId": "be000000-0000-0000-0000-000000000005",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
          "value": "balancing",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000019",\r
          "edgeId": "be000000-0000-0000-0000-000000000005",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000004",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000020",\r
          "edgeId": "be000000-0000-0000-0000-000000000005",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000006",\r
          "value": "4",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#3d9e5f"\r
    },\r
    {\r
      "id": "be000000-0000-0000-0000-000000000006",\r
      "sourceId": "b5000000-0000-0000-0000-000000000005",\r
      "targetId": "b5000000-0000-0000-0000-000000000003",\r
      "sourceHandle": "left",\r
      "targetHandle": "right",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000021",\r
          "edgeId": "be000000-0000-0000-0000-000000000006",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
          "value": "negative",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000022",\r
          "edgeId": "be000000-0000-0000-0000-000000000006",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
          "value": "balancing",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000023",\r
          "edgeId": "be000000-0000-0000-0000-000000000006",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000004",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000024",\r
          "edgeId": "be000000-0000-0000-0000-000000000006",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000006",\r
          "value": "4",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#c83030"\r
    },\r
    {\r
      "id": "be000000-0000-0000-0000-000000000007",\r
      "sourceId": "b5000000-0000-0000-0000-000000000006",\r
      "targetId": "b5000000-0000-0000-0000-000000000001",\r
      "sourceHandle": "top",\r
      "targetHandle": "bottom",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000025",\r
          "edgeId": "be000000-0000-0000-0000-000000000007",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
          "value": "positive",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000026",\r
          "edgeId": "be000000-0000-0000-0000-000000000007",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000004",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000027",\r
          "edgeId": "be000000-0000-0000-0000-000000000007",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000006",\r
          "value": "3",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#3d9e5f"\r
    },\r
    {\r
      "id": "be000000-0000-0000-0000-000000000008",\r
      "sourceId": "b5000000-0000-0000-0000-000000000007",\r
      "targetId": "b5000000-0000-0000-0000-000000000005",\r
      "sourceHandle": "top",\r
      "targetHandle": "bottom",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000028",\r
          "edgeId": "be000000-0000-0000-0000-000000000008",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000001",\r
          "value": "positive",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000029",\r
          "edgeId": "be000000-0000-0000-0000-000000000008",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000002",\r
          "value": "balancing",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000030",\r
          "edgeId": "be000000-0000-0000-0000-000000000008",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000004",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bf000000-0000-0000-0000-000000000031",\r
          "edgeId": "be000000-0000-0000-0000-000000000008",\r
          "paramDefId": "b3000000-0000-0000-0000-000000000006",\r
          "value": "3",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#3d9e5f"\r
    }\r
  ],\r
  "regions": [\r
    {\r
      "id": "b7000000-0000-0000-0000-000000000001",\r
      "title": "Growth Loop (R1)",\r
      "x": 80.0,\r
      "y": 80.0,\r
      "width": 1376.0,\r
      "height": 512.0,\r
      "color": "#3d9e5f",\r
      "createdAt": "2026-05-25T00:00:00Z"\r
    },\r
    {\r
      "id": "b7000000-0000-0000-0000-000000000002",\r
      "title": "Churn Pressure (B1)",\r
      "x": 1328.0,\r
      "y": 384.0,\r
      "width": 448.0,\r
      "height": 512.0,\r
      "color": "#c83030",\r
      "createdAt": "2026-05-25T00:00:00Z"\r
    }\r
  ]\r
}`,co=`{\r
  "version": 8,\r
  "exportedAt": "2026-05-25T00:00:00Z",\r
  "settings": {\r
    "presetName": "Knowledge Map",\r
    "paramDefs": [\r
      {\r
        "id": "c1000000-0000-0000-0000-000000000001",\r
        "presetId": "c0000000-0000-0000-0000-000000000001",\r
        "displayName": "Type",\r
        "paramType": "select_color",\r
        "defaultValue": null,\r
        "drivesColor": true,\r
        "showOnCardDefault": true,\r
        "sortOrder": 0,\r
        "options": [\r
          {\r
            "id": "c2000000-0000-0000-0000-000000000001",\r
            "paramDefId": "c1000000-0000-0000-0000-000000000001",\r
            "valueSlug": "concept",\r
            "label": "Concept",\r
            "color": "#5588bb",\r
            "sortOrder": 0\r
          },\r
          {\r
            "id": "c2000000-0000-0000-0000-000000000002",\r
            "paramDefId": "c1000000-0000-0000-0000-000000000001",\r
            "valueSlug": "principle",\r
            "label": "Claim",\r
            "color": "#d68b2a",\r
            "sortOrder": 1\r
          },\r
          {\r
            "id": "c2000000-0000-0000-0000-000000000003",\r
            "paramDefId": "c1000000-0000-0000-0000-000000000001",\r
            "valueSlug": "example",\r
            "label": "Evidence",\r
            "color": "#3d9e5f",\r
            "sortOrder": 2\r
          },\r
          {\r
            "id": "c2000000-0000-0000-0000-000000000004",\r
            "paramDefId": "c1000000-0000-0000-0000-000000000001",\r
            "valueSlug": "method",\r
            "label": "Method",\r
            "color": "#7766aa",\r
            "sortOrder": 3\r
          },\r
          {\r
            "id": "c2000000-0000-0000-0000-000000000005",\r
            "paramDefId": "c1000000-0000-0000-0000-000000000001",\r
            "valueSlug": "source",\r
            "label": "Source",\r
            "color": "#888888",\r
            "sortOrder": 4\r
          },\r
          {\r
            "id": "c2000000-0000-0000-0000-000000000006",\r
            "paramDefId": "c1000000-0000-0000-0000-000000000001",\r
            "valueSlug": "question",\r
            "label": "Question",\r
            "color": "#c83030",\r
            "sortOrder": 5\r
          }\r
        ]\r
      },\r
      {\r
        "id": "c1000000-0000-0000-0000-000000000002",\r
        "presetId": "c0000000-0000-0000-0000-000000000001",\r
        "displayName": "Confidence (%)",\r
        "paramType": "number",\r
        "defaultValue": null,\r
        "drivesColor": false,\r
        "showOnCardDefault": false,\r
        "sortOrder": 1,\r
        "options": []\r
      },\r
      {\r
        "id": "c1000000-0000-0000-0000-000000000003",\r
        "presetId": "c0000000-0000-0000-0000-000000000001",\r
        "displayName": "Source",\r
        "paramType": "text",\r
        "defaultValue": null,\r
        "drivesColor": false,\r
        "showOnCardDefault": false,\r
        "sortOrder": 2,\r
        "options": []\r
      }\r
    ],\r
    "edgeParamDefs": [\r
      {\r
        "id": "c3000000-0000-0000-0000-000000000001",\r
        "presetId": "c0000000-0000-0000-0000-000000000001",\r
        "displayName": "Relation",\r
        "paramType": "select_color",\r
        "defaultValue": null,\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": true,\r
        "drivesWidth": false,\r
        "sortOrder": 0,\r
        "options": [\r
          {\r
            "id": "c4000000-0000-0000-0000-000000000001",\r
            "paramDefId": "c3000000-0000-0000-0000-000000000001",\r
            "valueSlug": "supports",\r
            "label": "Supports",\r
            "color": "#3d9e5f",\r
            "sortOrder": 0\r
          },\r
          {\r
            "id": "c4000000-0000-0000-0000-000000000002",\r
            "paramDefId": "c3000000-0000-0000-0000-000000000001",\r
            "valueSlug": "contradicts",\r
            "label": "Contradicts",\r
            "color": "#c83030",\r
            "sortOrder": 1\r
          },\r
          {\r
            "id": "c4000000-0000-0000-0000-000000000003",\r
            "paramDefId": "c3000000-0000-0000-0000-000000000001",\r
            "valueSlug": "extends",\r
            "label": "Extends",\r
            "color": "#5588bb",\r
            "sortOrder": 2\r
          },\r
          {\r
            "id": "c4000000-0000-0000-0000-000000000004",\r
            "paramDefId": "c3000000-0000-0000-0000-000000000001",\r
            "valueSlug": "implies",\r
            "label": "Implies",\r
            "color": "#d68b2a",\r
            "sortOrder": 3\r
          },\r
          {\r
            "id": "c4000000-0000-0000-0000-000000000005",\r
            "paramDefId": "c3000000-0000-0000-0000-000000000001",\r
            "valueSlug": "cites",\r
            "label": "Cites",\r
            "color": "#7766aa",\r
            "sortOrder": 4\r
          },\r
          {\r
            "id": "c4000000-0000-0000-0000-000000000006",\r
            "paramDefId": "c3000000-0000-0000-0000-000000000001",\r
            "valueSlug": "related",\r
            "label": "Related",\r
            "color": "#888888",\r
            "sortOrder": 5\r
          }\r
        ]\r
      },\r
      {\r
        "id": "c3000000-0000-0000-0000-000000000002",\r
        "presetId": "c0000000-0000-0000-0000-000000000001",\r
        "displayName": "Directed",\r
        "paramType": "boolean",\r
        "defaultValue": "true",\r
        "drivesArrow": true,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": false,\r
        "sortOrder": 1,\r
        "options": []\r
      },\r
      {\r
        "id": "c3000000-0000-0000-0000-000000000003",\r
        "presetId": "c0000000-0000-0000-0000-000000000001",\r
        "displayName": "Weight",\r
        "paramType": "number",\r
        "defaultValue": "2",\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": true,\r
        "sortOrder": 2,\r
        "options": []\r
      },\r
      {\r
        "id": "c3000000-0000-0000-0000-000000000004",\r
        "presetId": "c0000000-0000-0000-0000-000000000001",\r
        "displayName": "Notes",\r
        "paramType": "text",\r
        "defaultValue": null,\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": false,\r
        "sortOrder": 3,\r
        "options": []\r
      }\r
    ]\r
  },\r
  "nodes": [\r
    {\r
      "id": "c5000000-0000-0000-0000-000000000001",\r
      "title": "Ordinary World",\r
      "description": "The hero's starting point — familiar, comfortable, limited. We meet Luke on Tatooine, Frodo in the Shire, Dorothy in Kansas. The status quo before the adventure begins.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 128.0,\r
      "y": 448.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "c6000000-0000-0000-0000-000000000001",\r
          "nodeId": "c5000000-0000-0000-0000-000000000001",\r
          "paramDefId": "c1000000-0000-0000-0000-000000000001",\r
          "value": "concept",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        }\r
      ]\r
    },\r
    {\r
      "id": "c5000000-0000-0000-0000-000000000002",\r
      "title": "Call to Adventure",\r
      "description": "A disruption that forces the hero out of their comfort zone. A message, a stranger, a crisis. The story actually starts here. Refusal is common — and temporary.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 512.0,\r
      "y": 192.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "c6000000-0000-0000-0000-000000000002",\r
          "nodeId": "c5000000-0000-0000-0000-000000000002",\r
          "paramDefId": "c1000000-0000-0000-0000-000000000001",\r
          "value": "concept",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        }\r
      ]\r
    },\r
    {\r
      "id": "c5000000-0000-0000-0000-000000000003",\r
      "title": "Crossing the Threshold",\r
      "description": "The point of no return. The hero commits to the journey by entering the special world. Ordinary rules no longer apply. This is where Act 1 ends.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 864.0,\r
      "y": 448.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "c6000000-0000-0000-0000-000000000003",\r
          "nodeId": "c5000000-0000-0000-0000-000000000003",\r
          "paramDefId": "c1000000-0000-0000-0000-000000000001",\r
          "value": "concept",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        }\r
      ]\r
    },\r
    {\r
      "id": "c5000000-0000-0000-0000-000000000004",\r
      "title": "Road of Trials",\r
      "description": "A gauntlet of tests, enemies, and allies. The hero fails often. Each trial is a lesson in disguise. This is where the protagonist is forged.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 1248.0,\r
      "y": 192.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "c6000000-0000-0000-0000-000000000004",\r
          "nodeId": "c5000000-0000-0000-0000-000000000004",\r
          "paramDefId": "c1000000-0000-0000-0000-000000000001",\r
          "value": "concept",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        }\r
      ]\r
    },\r
    {\r
      "id": "c5000000-0000-0000-0000-000000000005",\r
      "title": "The Supreme Ordeal",\r
      "description": "The central crisis — the hero faces death (literal or symbolic) and must draw on everything learned so far. The darkest moment before the transformation.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 1632.0,\r
      "y": 448.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "c6000000-0000-0000-0000-000000000005",\r
          "nodeId": "c5000000-0000-0000-0000-000000000005",\r
          "paramDefId": "c1000000-0000-0000-0000-000000000001",\r
          "value": "concept",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        }\r
      ]\r
    },\r
    {\r
      "id": "c5000000-0000-0000-0000-000000000006",\r
      "title": "Return Transformed",\r
      "description": "The hero returns carrying the prize. But the real change is internal — they are not the same person who left. Their world, or their place in it, has fundamentally shifted.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 1248.0,\r
      "y": 736.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "c6000000-0000-0000-0000-000000000006",\r
          "nodeId": "c5000000-0000-0000-0000-000000000006",\r
          "paramDefId": "c1000000-0000-0000-0000-000000000001",\r
          "value": "concept",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        }\r
      ]\r
    },\r
    {\r
      "id": "c5000000-0000-0000-0000-000000000007",\r
      "title": "Campbell — The Hero with a Thousand Faces",\r
      "description": "Campbell's foundational work identifying the monomyth: a single archetypal story structure found in myths, religious traditions, and folk tales across every human culture.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 128.0,\r
      "y": 768.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "c6000000-0000-0000-0000-000000000007",\r
          "nodeId": "c5000000-0000-0000-0000-000000000007",\r
          "paramDefId": "c1000000-0000-0000-0000-000000000001",\r
          "value": "source",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        }\r
      ]\r
    },\r
    {\r
      "id": "d87c570a-0372-4303-88a2-e62ed0493f89",\r
      "title": "About this demo",\r
      "description": "Note. A knowledge map of Campbell's Hero's Journey — the stages of the monomyth and how they connect. Notes, images, video and audio are \\"graph objects\\" you can drop anywhere and wire together.",\r
      "eventDate": null,\r
      "dateAdded": "2026-06-02T00:00:00Z",\r
      "x": 128.0,\r
      "y": -128.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "tags": [],\r
      "links": [],\r
      "media": [],\r
      "paramValues": [],\r
      "isPinned": false,\r
      "isExpandPinned": false,\r
      "zOrder": 0,\r
      "kind": "note",\r
      "width": 280,\r
      "height": 150\r
    }\r
  ],\r
  "edges": [\r
    {\r
      "id": "ce000000-0000-0000-0000-000000000001",\r
      "sourceId": "c5000000-0000-0000-0000-000000000001",\r
      "targetId": "c5000000-0000-0000-0000-000000000002",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000001",\r
          "edgeId": "ce000000-0000-0000-0000-000000000001",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000001",\r
          "value": "implies",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000002",\r
          "edgeId": "ce000000-0000-0000-0000-000000000001",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000003",\r
          "edgeId": "ce000000-0000-0000-0000-000000000001",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000003",\r
          "value": "3",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#d68b2a"\r
    },\r
    {\r
      "id": "ce000000-0000-0000-0000-000000000002",\r
      "sourceId": "c5000000-0000-0000-0000-000000000002",\r
      "targetId": "c5000000-0000-0000-0000-000000000003",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000004",\r
          "edgeId": "ce000000-0000-0000-0000-000000000002",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000001",\r
          "value": "implies",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000005",\r
          "edgeId": "ce000000-0000-0000-0000-000000000002",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000006",\r
          "edgeId": "ce000000-0000-0000-0000-000000000002",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000003",\r
          "value": "3",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#d68b2a"\r
    },\r
    {\r
      "id": "ce000000-0000-0000-0000-000000000003",\r
      "sourceId": "c5000000-0000-0000-0000-000000000003",\r
      "targetId": "c5000000-0000-0000-0000-000000000004",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000007",\r
          "edgeId": "ce000000-0000-0000-0000-000000000003",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000001",\r
          "value": "implies",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000008",\r
          "edgeId": "ce000000-0000-0000-0000-000000000003",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000009",\r
          "edgeId": "ce000000-0000-0000-0000-000000000003",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000003",\r
          "value": "3",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#d68b2a"\r
    },\r
    {\r
      "id": "ce000000-0000-0000-0000-000000000004",\r
      "sourceId": "c5000000-0000-0000-0000-000000000004",\r
      "targetId": "c5000000-0000-0000-0000-000000000005",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000010",\r
          "edgeId": "ce000000-0000-0000-0000-000000000004",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000001",\r
          "value": "implies",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000011",\r
          "edgeId": "ce000000-0000-0000-0000-000000000004",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000012",\r
          "edgeId": "ce000000-0000-0000-0000-000000000004",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000003",\r
          "value": "3",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#d68b2a"\r
    },\r
    {\r
      "id": "ce000000-0000-0000-0000-000000000005",\r
      "sourceId": "c5000000-0000-0000-0000-000000000005",\r
      "targetId": "c5000000-0000-0000-0000-000000000006",\r
      "sourceHandle": "left",\r
      "targetHandle": "right",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000013",\r
          "edgeId": "ce000000-0000-0000-0000-000000000005",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000001",\r
          "value": "implies",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000014",\r
          "edgeId": "ce000000-0000-0000-0000-000000000005",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000015",\r
          "edgeId": "ce000000-0000-0000-0000-000000000005",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000003",\r
          "value": "3",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#d68b2a"\r
    },\r
    {\r
      "id": "ce000000-0000-0000-0000-000000000006",\r
      "sourceId": "c5000000-0000-0000-0000-000000000001",\r
      "targetId": "c5000000-0000-0000-0000-000000000006",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000016",\r
          "edgeId": "ce000000-0000-0000-0000-000000000006",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000001",\r
          "value": "related",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000017",\r
          "edgeId": "ce000000-0000-0000-0000-000000000006",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000018",\r
          "edgeId": "ce000000-0000-0000-0000-000000000006",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000003",\r
          "value": "2",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#888888"\r
    },\r
    {\r
      "id": "ce000000-0000-0000-0000-000000000007",\r
      "sourceId": "c5000000-0000-0000-0000-000000000007",\r
      "targetId": "c5000000-0000-0000-0000-000000000001",\r
      "sourceHandle": "top",\r
      "targetHandle": "bottom",\r
      "waypoints": null,\r
      "paramValues": [\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000019",\r
          "edgeId": "ce000000-0000-0000-0000-000000000007",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000001",\r
          "value": "cites",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000020",\r
          "edgeId": "ce000000-0000-0000-0000-000000000007",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "cf000000-0000-0000-0000-000000000021",\r
          "edgeId": "ce000000-0000-0000-0000-000000000007",\r
          "paramDefId": "c3000000-0000-0000-0000-000000000003",\r
          "value": "2",\r
          "isEnabled": true\r
        }\r
      ],\r
      "color": "#7766aa"\r
    }\r
  ],\r
  "regions": [\r
    {\r
      "id": "c7000000-0000-0000-0000-000000000001",\r
      "title": "The Departure",\r
      "x": 48.0,\r
      "y": 96.0,\r
      "width": 992.0,\r
      "height": 480.0,\r
      "color": "#5588bb",\r
      "createdAt": "2026-05-25T00:00:00Z"\r
    },\r
    {\r
      "id": "c7000000-0000-0000-0000-000000000002",\r
      "title": "The Ordeal & Return",\r
      "x": 1168.0,\r
      "y": 96.0,\r
      "width": 736.0,\r
      "height": 800.0,\r
      "color": "#c83030",\r
      "createdAt": "2026-05-25T00:00:00Z"\r
    }\r
  ]\r
}`,uo=`{\r
  "version": 8,\r
  "exportedAt": "2026-05-31T03:01:20.322701900+00:00",\r
  "settings": {\r
    "presetName": "Project Tracker",\r
    "paramDefs": [\r
      {\r
        "id": "00000000-0000-0004-0004-000000000001",\r
        "presetId": "00000000-0000-0000-0000-000000000004",\r
        "displayName": "Status",\r
        "paramType": "select_color",\r
        "defaultValue": null,\r
        "drivesColor": true,\r
        "showOnCardDefault": true,\r
        "sortOrder": 0,\r
        "options": [\r
          {\r
            "id": "00000000-0000-0005-0041-000000000001",\r
            "paramDefId": "00000000-0000-0004-0004-000000000001",\r
            "valueSlug": "todo",\r
            "label": "To Do",\r
            "color": "#888888",\r
            "sortOrder": 0\r
          },\r
          {\r
            "id": "00000000-0000-0005-0041-000000000002",\r
            "paramDefId": "00000000-0000-0004-0004-000000000001",\r
            "valueSlug": "in_progress",\r
            "label": "In Progress",\r
            "color": "#d68b2a",\r
            "sortOrder": 1\r
          },\r
          {\r
            "id": "00000000-0000-0005-0041-000000000005",\r
            "paramDefId": "00000000-0000-0004-0004-000000000001",\r
            "valueSlug": "in_review",\r
            "label": "In Review",\r
            "color": "#5588bb",\r
            "sortOrder": 2\r
          },\r
          {\r
            "id": "00000000-0000-0005-0041-000000000003",\r
            "paramDefId": "00000000-0000-0004-0004-000000000001",\r
            "valueSlug": "done",\r
            "label": "Done",\r
            "color": "#3d9e5f",\r
            "sortOrder": 3\r
          },\r
          {\r
            "id": "00000000-0000-0005-0041-000000000004",\r
            "paramDefId": "00000000-0000-0004-0004-000000000001",\r
            "valueSlug": "blocked",\r
            "label": "Blocked",\r
            "color": "#c83030",\r
            "sortOrder": 4\r
          }\r
        ]\r
      },\r
      {\r
        "id": "00000000-0000-0004-0004-000000000003",\r
        "presetId": "00000000-0000-0000-0000-000000000004",\r
        "displayName": "Type",\r
        "paramType": "select_color",\r
        "defaultValue": null,\r
        "drivesColor": false,\r
        "showOnCardDefault": false,\r
        "sortOrder": 1,\r
        "options": [\r
          {\r
            "id": "00000000-0000-0005-0043-000000000001",\r
            "paramDefId": "00000000-0000-0004-0004-000000000003",\r
            "valueSlug": "task",\r
            "label": "Task",\r
            "color": "#888888",\r
            "sortOrder": 0\r
          },\r
          {\r
            "id": "00000000-0000-0005-0043-000000000002",\r
            "paramDefId": "00000000-0000-0004-0004-000000000003",\r
            "valueSlug": "feature",\r
            "label": "Feature",\r
            "color": "#3d9e5f",\r
            "sortOrder": 1\r
          },\r
          {\r
            "id": "00000000-0000-0005-0043-000000000003",\r
            "paramDefId": "00000000-0000-0004-0004-000000000003",\r
            "valueSlug": "bug",\r
            "label": "Bug",\r
            "color": "#c83030",\r
            "sortOrder": 2\r
          },\r
          {\r
            "id": "00000000-0000-0005-0043-000000000004",\r
            "paramDefId": "00000000-0000-0004-0004-000000000003",\r
            "valueSlug": "epic",\r
            "label": "Epic",\r
            "color": "#5588bb",\r
            "sortOrder": 3\r
          },\r
          {\r
            "id": "00000000-0000-0005-0043-000000000005",\r
            "paramDefId": "00000000-0000-0004-0004-000000000003",\r
            "valueSlug": "milestone",\r
            "label": "Milestone",\r
            "color": "#d68b2a",\r
            "sortOrder": 4\r
          }\r
        ]\r
      },\r
      {\r
        "id": "00000000-0000-0004-0004-000000000002",\r
        "presetId": "00000000-0000-0000-0000-000000000004",\r
        "displayName": "Priority",\r
        "paramType": "select_color",\r
        "defaultValue": null,\r
        "drivesColor": false,\r
        "showOnCardDefault": false,\r
        "sortOrder": 2,\r
        "options": [\r
          {\r
            "id": "00000000-0000-0005-0042-000000000001",\r
            "paramDefId": "00000000-0000-0004-0004-000000000002",\r
            "valueSlug": "low",\r
            "label": "Low",\r
            "color": "#888888",\r
            "sortOrder": 0\r
          },\r
          {\r
            "id": "00000000-0000-0005-0042-000000000002",\r
            "paramDefId": "00000000-0000-0004-0004-000000000002",\r
            "valueSlug": "medium",\r
            "label": "Medium",\r
            "color": "#5588bb",\r
            "sortOrder": 1\r
          },\r
          {\r
            "id": "00000000-0000-0005-0042-000000000003",\r
            "paramDefId": "00000000-0000-0004-0004-000000000002",\r
            "valueSlug": "high",\r
            "label": "High",\r
            "color": "#d68b2a",\r
            "sortOrder": 2\r
          },\r
          {\r
            "id": "00000000-0000-0005-0042-000000000004",\r
            "paramDefId": "00000000-0000-0004-0004-000000000002",\r
            "valueSlug": "critical",\r
            "label": "Critical",\r
            "color": "#c83030",\r
            "sortOrder": 3\r
          }\r
        ]\r
      },\r
      {\r
        "id": "00000000-0000-0004-0004-000000000004",\r
        "presetId": "00000000-0000-0000-0000-000000000004",\r
        "displayName": "Estimate (pts)",\r
        "paramType": "number",\r
        "defaultValue": null,\r
        "drivesColor": false,\r
        "showOnCardDefault": false,\r
        "sortOrder": 3,\r
        "options": []\r
      }\r
    ],\r
    "edgeParamDefs": [\r
      {\r
        "id": "00000000-0000-0006-0004-000000000001",\r
        "presetId": "00000000-0000-0000-0000-000000000004",\r
        "displayName": "Relationship",\r
        "paramType": "select_color",\r
        "defaultValue": null,\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": true,\r
        "drivesWidth": false,\r
        "sortOrder": 0,\r
        "options": [\r
          {\r
            "id": "00000000-0000-0007-0041-000000000001",\r
            "paramDefId": "00000000-0000-0006-0004-000000000001",\r
            "valueSlug": "depends_on",\r
            "label": "Depends On",\r
            "color": "#c83030",\r
            "sortOrder": 0\r
          },\r
          {\r
            "id": "00000000-0000-0007-0041-000000000002",\r
            "paramDefId": "00000000-0000-0006-0004-000000000001",\r
            "valueSlug": "blocks",\r
            "label": "Blocks",\r
            "color": "#d68b2a",\r
            "sortOrder": 1\r
          },\r
          {\r
            "id": "00000000-0000-0007-0041-000000000004",\r
            "paramDefId": "00000000-0000-0006-0004-000000000001",\r
            "valueSlug": "part_of",\r
            "label": "Part Of",\r
            "color": "#7766aa",\r
            "sortOrder": 2\r
          },\r
          {\r
            "id": "00000000-0000-0007-0041-000000000005",\r
            "paramDefId": "00000000-0000-0006-0004-000000000001",\r
            "valueSlug": "triggers",\r
            "label": "Triggers",\r
            "color": "#00b0c8",\r
            "sortOrder": 3\r
          },\r
          {\r
            "id": "00000000-0000-0007-0041-000000000003",\r
            "paramDefId": "00000000-0000-0006-0004-000000000001",\r
            "valueSlug": "related",\r
            "label": "Related",\r
            "color": "#5588bb",\r
            "sortOrder": 4\r
          }\r
        ]\r
      },\r
      {\r
        "id": "00000000-0000-0006-0004-000000000002",\r
        "presetId": "00000000-0000-0000-0000-000000000004",\r
        "displayName": "Directed",\r
        "paramType": "boolean",\r
        "defaultValue": "true",\r
        "drivesArrow": true,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": false,\r
        "sortOrder": 1,\r
        "options": []\r
      },\r
      {\r
        "id": "00000000-0000-0006-0004-000000000003",\r
        "presetId": "00000000-0000-0000-0000-000000000004",\r
        "displayName": "Notes",\r
        "paramType": "text",\r
        "defaultValue": null,\r
        "drivesArrow": false,\r
        "drivesStyle": false,\r
        "drivesColor": false,\r
        "drivesWidth": false,\r
        "sortOrder": 2,\r
        "options": []\r
      }\r
    ]\r
  },\r
  "nodes": [\r
    {\r
      "id": "d-node-01",\r
      "title": "Choose Your Niche",\r
      "description": "Pick a topic you can talk about for years. The narrower and more specific, the better — 'true crime from medieval Europe' is a show; 'true crime' is a genre.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 128.0,\r
      "y": 448.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "externalId": null,\r
      "tags": [],\r
      "dataSource": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "c824c7d9-89d8-4d8f-9e54-d39f83aeed2a",\r
          "nodeId": "d-node-01",\r
          "paramDefId": "00000000-0000-0004-0004-000000000001",\r
          "value": "done",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "376d8e36-cc59-466e-a979-c9a84bf2f25f",\r
          "nodeId": "d-node-01",\r
          "paramDefId": "00000000-0000-0004-0004-000000000003",\r
          "value": "task",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false\r
    },\r
    {\r
      "id": "d-node-02",\r
      "title": "Plan First 10 Episodes",\r
      "description": "Outline your first season before recording a word. Episode titles, guests, talking points. This is where you discover whether you actually have enough material.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 576.0,\r
      "y": 192.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "externalId": null,\r
      "tags": [],\r
      "dataSource": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "21253d00-874a-460c-bcb5-564662bf0f40",\r
          "nodeId": "d-node-02",\r
          "paramDefId": "00000000-0000-0004-0004-000000000001",\r
          "value": "in_progress",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "8e2d834c-2b28-47c8-b0c0-33b9b965a22b",\r
          "nodeId": "d-node-02",\r
          "paramDefId": "00000000-0000-0004-0004-000000000002",\r
          "value": null,\r
          "isEnabled": true,\r
          "showOnCard": false\r
        },\r
        {\r
          "id": "e3c665a4-bc1c-4093-a0ed-da08498df209",\r
          "nodeId": "d-node-02",\r
          "paramDefId": "00000000-0000-0004-0004-000000000003",\r
          "value": "task",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "001112ff-397f-46cd-9fea-25aa71c69872",\r
          "nodeId": "d-node-02",\r
          "paramDefId": "00000000-0000-0004-0004-000000000004",\r
          "value": null,\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false\r
    },\r
    {\r
      "id": "d-node-03",\r
      "title": "Record Pilot Episode",\r
      "description": "Record episode zero. Don't stress about production quality — focus on finding your voice and format. Nobody hears this one; it's for you.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 576.0,\r
      "y": 704.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "externalId": null,\r
      "tags": [],\r
      "dataSource": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "3a53962b-3bf7-45cf-8c4d-7f7b4d4e9c88",\r
          "nodeId": "d-node-03",\r
          "paramDefId": "00000000-0000-0004-0004-000000000001",\r
          "value": "done",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "5591e15c-6a5d-40af-926e-8f525db1ff01",\r
          "nodeId": "d-node-03",\r
          "paramDefId": "00000000-0000-0004-0004-000000000003",\r
          "value": "task",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false\r
    },\r
    {\r
      "id": "d-node-04",\r
      "title": "Design Cover Art",\r
      "description": "Your thumbnail in a sea of thumbnails. Podcast art renders at 50×50px in most apps. Bold, legible, zero visual clutter.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 992.0,\r
      "y": 192.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "externalId": null,\r
      "tags": [],\r
      "dataSource": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "c44e3cc9-2937-4ba3-9600-84c714ec5598",\r
          "nodeId": "d-node-04",\r
          "paramDefId": "00000000-0000-0004-0004-000000000001",\r
          "value": "in_review",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "f11138e7-9e01-47d3-975f-bab2375ee3fb",\r
          "nodeId": "d-node-04",\r
          "paramDefId": "00000000-0000-0004-0004-000000000003",\r
          "value": "task",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false\r
    },\r
    {\r
      "id": "d-node-05",\r
      "title": "Write Show Notes Template",\r
      "description": "A repeatable format for every episode: summary, timestamps, links, transcript. Write it once, fill it in forever. Saves hours per release.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 992.0,\r
      "y": 704.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "externalId": null,\r
      "tags": [],\r
      "dataSource": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "0f937fa3-3ef2-413e-b86f-3e9c86b338e9",\r
          "nodeId": "d-node-05",\r
          "paramDefId": "00000000-0000-0004-0004-000000000001",\r
          "value": "todo",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "0d49c381-6218-48b5-8095-19e9c7a05245",\r
          "nodeId": "d-node-05",\r
          "paramDefId": "00000000-0000-0004-0004-000000000003",\r
          "value": "task",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false\r
    },\r
    {\r
      "id": "d-node-06",\r
      "title": "Set Up RSS Feed",\r
      "description": "RSS is how podcasts reach every app at once. Buzzsprout, Anchor, or Transistor all handle hosting and feed generation. One feed, everywhere.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 1472.0,\r
      "y": 448.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "externalId": null,\r
      "tags": [],\r
      "dataSource": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "1c10b4a6-64aa-4e48-b714-3d843bbaa478",\r
          "nodeId": "d-node-06",\r
          "paramDefId": "00000000-0000-0004-0004-000000000001",\r
          "value": "done",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "42de0749-3d2b-4c8e-b870-bc09c95d1909",\r
          "nodeId": "d-node-06",\r
          "paramDefId": "00000000-0000-0004-0004-000000000003",\r
          "value": "task",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false\r
    },\r
    {\r
      "id": "d-node-07",\r
      "title": "Submit to Spotify & Apple",\r
      "description": "Submit your RSS feed URL to Apple Podcasts and Spotify. Both take 24–72 hours to approve. Do this well before your launch date.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 1856.0,\r
      "y": 192.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "externalId": null,\r
      "tags": [],\r
      "dataSource": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "db2d5488-3999-4509-9e85-8d63771baf67",\r
          "nodeId": "d-node-07",\r
          "paramDefId": "00000000-0000-0004-0004-000000000001",\r
          "value": "todo",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "07f40fa7-d3c6-4a9c-b965-68f5b31632bd",\r
          "nodeId": "d-node-07",\r
          "paramDefId": "00000000-0000-0004-0004-000000000003",\r
          "value": "task",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false\r
    },\r
    {\r
      "id": "d-node-08",\r
      "title": "Episode 1 Launch",\r
      "description": "Your public debut. Schedule a date, tell your audience, and ship it. Perfect is the enemy of published — get it out the door.",\r
      "eventDate": null,\r
      "dateAdded": "2026-05-25T00:00:00Z",\r
      "x": 1856.0,\r
      "y": 704.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "externalId": null,\r
      "tags": [],\r
      "dataSource": null,\r
      "links": [],\r
      "media": [],\r
      "paramValues": [\r
        {\r
          "id": "f7a8c63b-0e58-4f12-9489-205859b6158d",\r
          "nodeId": "d-node-08",\r
          "paramDefId": "00000000-0000-0004-0004-000000000001",\r
          "value": "todo",\r
          "isEnabled": true,\r
          "showOnCard": true\r
        },\r
        {\r
          "id": "21cb5017-f2be-4027-b418-ae9c5ae2abe2",\r
          "nodeId": "d-node-08",\r
          "paramDefId": "00000000-0000-0004-0004-000000000003",\r
          "value": "milestone",\r
          "isEnabled": true,\r
          "showOnCard": false\r
        }\r
      ],\r
      "isPinned": false,\r
      "isExpandPinned": false\r
    },\r
    {\r
      "id": "db2213ed-6a59-4cde-925c-60368aa9783d",\r
      "title": "About this demo",\r
      "description": "Note. A launch plan for a new podcast — tasks, dependencies, and milestones. Leave context next to tasks with notes like this — resize them and connect them to any node.",\r
      "eventDate": null,\r
      "dateAdded": "2026-06-02T00:00:00Z",\r
      "x": 128.0,\r
      "y": -128.0,\r
      "color": null,\r
      "confidence": null,\r
      "impactMagnitude": null,\r
      "tags": [],\r
      "links": [],\r
      "media": [],\r
      "paramValues": [],\r
      "isPinned": false,\r
      "isExpandPinned": false,\r
      "zOrder": 0,\r
      "kind": "note",\r
      "width": 280,\r
      "height": 150\r
    }\r
  ],\r
  "edges": [\r
    {\r
      "id": "d-edge-01",\r
      "sourceId": "d-node-01",\r
      "targetId": "d-node-02",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "paramValues": [\r
        {\r
          "id": "7b8f50f2-ea0b-4783-868d-4ef1a33603f7",\r
          "edgeId": "d-edge-01",\r
          "paramDefId": "00000000-0000-0006-0004-000000000001",\r
          "value": "triggers",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "9ab84953-00b3-4986-af0d-7a63a0ab8bbe",\r
          "edgeId": "d-edge-01",\r
          "paramDefId": "00000000-0000-0006-0004-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "4df8e40b-f1e4-4b22-95f7-6cceafda371d",\r
          "edgeId": "d-edge-01",\r
          "paramDefId": "00000000-0000-0006-0004-000000000003",\r
          "value": "Niche determines the episode roster and potential guests",\r
          "isEnabled": true\r
        }\r
      ],\r
      "waypoints": null,\r
      "externalId": null,\r
      "label": null,\r
      "color": "#00b0c8"\r
    },\r
    {\r
      "id": "d-edge-02",\r
      "sourceId": "d-node-01",\r
      "targetId": "d-node-03",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "paramValues": [\r
        {\r
          "id": "9009d157-81d0-424d-afd1-2dbe6fed5ca5",\r
          "edgeId": "d-edge-02",\r
          "paramDefId": "00000000-0000-0006-0004-000000000001",\r
          "value": "triggers",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "cc1b4344-e2a7-4a05-9787-c1016e846aa8",\r
          "edgeId": "d-edge-02",\r
          "paramDefId": "00000000-0000-0006-0004-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bc3c7c90-5fb0-4ed7-9430-8458925cb138",\r
          "edgeId": "d-edge-02",\r
          "paramDefId": "00000000-0000-0006-0004-000000000003",\r
          "value": "Can't record anything meaningful without knowing your angle",\r
          "isEnabled": true\r
        }\r
      ],\r
      "waypoints": null,\r
      "externalId": null,\r
      "label": null,\r
      "color": "#00b0c8"\r
    },\r
    {\r
      "id": "d-edge-03",\r
      "sourceId": "d-node-02",\r
      "targetId": "d-node-04",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "paramValues": [\r
        {\r
          "id": "04643193-5e19-42a3-ad98-7427784f9c51",\r
          "edgeId": "d-edge-03",\r
          "paramDefId": "00000000-0000-0006-0004-000000000001",\r
          "value": "related",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "dd4986b7-81a1-42df-8153-4616fc60507d",\r
          "edgeId": "d-edge-03",\r
          "paramDefId": "00000000-0000-0006-0004-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "e4124d99-6947-4a36-948e-d093f3baed26",\r
          "edgeId": "d-edge-03",\r
          "paramDefId": "00000000-0000-0006-0004-000000000003",\r
          "value": "Art style should reflect the tone of the episode content",\r
          "isEnabled": true\r
        }\r
      ],\r
      "waypoints": null,\r
      "externalId": null,\r
      "label": null,\r
      "color": "#5588bb"\r
    },\r
    {\r
      "id": "d-edge-04",\r
      "sourceId": "d-node-03",\r
      "targetId": "d-node-06",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "paramValues": [\r
        {\r
          "id": "6ff704df-28fe-428c-abe7-208da3d1380a",\r
          "edgeId": "d-edge-04",\r
          "paramDefId": "00000000-0000-0006-0004-000000000001",\r
          "value": "depends_on",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "f792e9c7-4ba6-4ce4-abc9-7195826ffba1",\r
          "edgeId": "d-edge-04",\r
          "paramDefId": "00000000-0000-0006-0004-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "73da4ce9-03e9-4ed6-9f76-2da9d6b58abc",\r
          "edgeId": "d-edge-04",\r
          "paramDefId": "00000000-0000-0006-0004-000000000003",\r
          "value": "Need at least one episode ready before submitting an RSS feed",\r
          "isEnabled": true\r
        }\r
      ],\r
      "waypoints": null,\r
      "externalId": null,\r
      "label": null,\r
      "color": "#c83030"\r
    },\r
    {\r
      "id": "d-edge-05",\r
      "sourceId": "d-node-04",\r
      "targetId": "d-node-07",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "paramValues": [\r
        {\r
          "id": "bf8cd14b-217c-449e-b330-5bdb2294f81f",\r
          "edgeId": "d-edge-05",\r
          "paramDefId": "00000000-0000-0006-0004-000000000001",\r
          "value": "depends_on",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "a382a25a-86ad-475d-a585-ee9cf4163768",\r
          "edgeId": "d-edge-05",\r
          "paramDefId": "00000000-0000-0006-0004-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "5a92a517-0d9e-4c6d-8d46-f15baf4b01b3",\r
          "edgeId": "d-edge-05",\r
          "paramDefId": "00000000-0000-0006-0004-000000000003",\r
          "value": "Both Spotify and Apple require approved artwork at submission",\r
          "isEnabled": true\r
        }\r
      ],\r
      "waypoints": null,\r
      "externalId": null,\r
      "label": null,\r
      "color": "#c83030"\r
    },\r
    {\r
      "id": "d-edge-06",\r
      "sourceId": "d-node-06",\r
      "targetId": "d-node-07",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "paramValues": [\r
        {\r
          "id": "b97b94ae-78b6-47bd-82ad-1dfab0520632",\r
          "edgeId": "d-edge-06",\r
          "paramDefId": "00000000-0000-0006-0004-000000000001",\r
          "value": "depends_on",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "600739f6-56c1-4558-b852-b2c0414884c2",\r
          "edgeId": "d-edge-06",\r
          "paramDefId": "00000000-0000-0006-0004-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "3eb0c26a-a74a-4ef7-8354-b1f524171935",\r
          "edgeId": "d-edge-06",\r
          "paramDefId": "00000000-0000-0006-0004-000000000003",\r
          "value": "The RSS feed URL is what you submit to each platform directory",\r
          "isEnabled": true\r
        }\r
      ],\r
      "waypoints": null,\r
      "externalId": null,\r
      "label": null,\r
      "color": "#c83030"\r
    },\r
    {\r
      "id": "d-edge-07",\r
      "sourceId": "d-node-07",\r
      "targetId": "d-node-08",\r
      "sourceHandle": "bottom",\r
      "targetHandle": "top",\r
      "paramValues": [\r
        {\r
          "id": "87ad3cc1-3620-49b0-b387-d414c48de1c1",\r
          "edgeId": "d-edge-07",\r
          "paramDefId": "00000000-0000-0006-0004-000000000001",\r
          "value": "triggers",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "bea37d53-8177-40d9-9c00-e9a01378a73f",\r
          "edgeId": "d-edge-07",\r
          "paramDefId": "00000000-0000-0006-0004-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "5304ddd6-64dd-4000-8edb-acecbbf9d10d",\r
          "edgeId": "d-edge-07",\r
          "paramDefId": "00000000-0000-0006-0004-000000000003",\r
          "value": "Platform approval takes 24–72 hours; submit before launch day",\r
          "isEnabled": true\r
        }\r
      ],\r
      "waypoints": null,\r
      "externalId": null,\r
      "label": null,\r
      "color": "#00b0c8"\r
    },\r
    {\r
      "id": "d-edge-08",\r
      "sourceId": "d-node-05",\r
      "targetId": "d-node-08",\r
      "sourceHandle": "right",\r
      "targetHandle": "left",\r
      "paramValues": [\r
        {\r
          "id": "ce90f4f2-00bf-4e6b-b8d4-5715ea095b68",\r
          "edgeId": "d-edge-08",\r
          "paramDefId": "00000000-0000-0006-0004-000000000001",\r
          "value": "part_of",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "e171f47d-37e3-4374-abac-71a6a1bf3335",\r
          "edgeId": "d-edge-08",\r
          "paramDefId": "00000000-0000-0006-0004-000000000002",\r
          "value": "true",\r
          "isEnabled": true\r
        },\r
        {\r
          "id": "cbe13b73-89a5-4779-89e9-965a155cf412",\r
          "edgeId": "d-edge-08",\r
          "paramDefId": "00000000-0000-0006-0004-000000000003",\r
          "value": "Show notes are part of the Episode 1 deliverable",\r
          "isEnabled": true\r
        }\r
      ],\r
      "waypoints": null,\r
      "externalId": null,\r
      "label": null,\r
      "color": "#7766aa"\r
    }\r
  ],\r
  "regions": [\r
    {\r
      "id": "d7000000-0000-0000-0000-000000000001",\r
      "title": "Content Prep",\r
      "x": 48.0,\r
      "y": 96.0,\r
      "width": 1216.0,\r
      "height": 768.0,\r
      "color": "#7766aa",\r
      "zOrder": 0,\r
      "isLocked": false,\r
      "isMinimized": false,\r
      "createdAt": "2026-05-30T20:23:37.448676100+00:00"\r
    },\r
    {\r
      "id": "d7000000-0000-0000-0000-000000000002",\r
      "title": "Publishing Pipeline",\r
      "x": 1392.0,\r
      "y": 96.0,\r
      "width": 880.0,\r
      "height": 768.0,\r
      "color": "#3d9e5f",\r
      "zOrder": 0,\r
      "isLocked": false,\r
      "isMinimized": false,\r
      "createdAt": "2026-05-30T20:23:37.448676100+00:00"\r
    }\r
  ],\r
  "bookmarks": null,\r
  "graphNotes": null\r
}`,$e={"software-architecture":JSON.parse(so),"agent-memory":JSON.parse(oo),"macro-economics":JSON.parse(io),"system-behavior":JSON.parse(lo),"knowledge-map":JSON.parse(co),"project-tracker":JSON.parse(uo)},zn={"software-architecture":"Payments platform architecture","agent-memory":"How a system's services connect","macro-economics":"2022-2023 Global Macro Crisis","system-behavior":"Population & Resource Feedback Loops","knowledge-map":"Understanding Inflation","project-tracker":"GloGraph Launch Plan"},Rt={"demo://software-architecture":$e["software-architecture"],"demo://agent-memory":$e["agent-memory"],"demo://macro-economics":$e["macro-economics"],"demo://system-behavior":$e["system-behavior"],"demo://knowledge-map":$e["knowledge-map"],"demo://project-tracker":$e["project-tracker"]},zt=[{name:zn["software-architecture"],path:"demo://software-architecture"},{name:zn["agent-memory"],path:"demo://agent-memory"},{name:zn["macro-economics"],path:"demo://macro-economics"},{name:zn["system-behavior"],path:"demo://system-behavior"},{name:zn["knowledge-map"],path:"demo://knowledge-map"},{name:zn["project-tracker"],path:"demo://project-tracker"}],po={presetName:"Blank",paramDefs:[],edgeParamDefs:[]},mo={"00000000-0000-0000-0000-000000000005":po,"00000000-0000-0000-0000-000000000001":$e["macro-economics"].settings,"00000000-0000-0000-0000-000000000002":$e["system-behavior"].settings,"00000000-0000-0000-0000-000000000003":$e["knowledge-map"].settings,"00000000-0000-0000-0000-000000000004":$e["project-tracker"].settings};function fo(n,r,t){const s=new Map;for(const h of r){const c=t==="downstream"?h.sourceId:h.targetId,b=t==="downstream"?h.targetId:h.sourceId;let x=s.get(c);x||(x=[],s.set(c,x)),x.push({to:b,edgeId:h.id})}const a=new Map([[n,0]]),i=new Set;let l=0;const d=[n];for(;d.length;){const h=d.shift(),c=a.get(h);for(const{to:b,edgeId:x}of s.get(h)??[])if(i.add(x),!a.has(b)){const m=c+1;a.set(b,m),m>l&&(l=m),d.push(b)}}const u=[...a.entries()].map(([h,c])=>({id:h,hop:c})).sort((h,c)=>h.hop-c.hop||(h.id<c.id?-1:h.id>c.id?1:0)),g=[...i].sort();return{seedId:n,direction:t,nodes:u,edgeIds:g,reachedCount:u.length-1,maxHop:l}}function ho(n,r){return Math.abs(n)>=Math.abs(r)?n>=0?["right","left"]:["left","right"]:r>=0?["bottom","top"]:["top","bottom"]}const ce=()=>crypto.randomUUID?crypto.randomUUID():"id-"+Math.random().toString(16).slice(2)+Date.now().toString(16),$n=()=>new Date().toISOString(),Ye=n=>JSON.parse(JSON.stringify(n)),st={};function go(n,r){return(st[n]||=new Set).add(r),()=>st[n]?.delete(r)}function hn(n,r){st[n]?.forEach(t=>{try{t({payload:r})}catch{}})}const xn={},kr={};let Ne=[],ve=null,At="",bo=0;const jr={},Ke=255,Oa=6,xo=1800*1e3,Pa=`Demo limit reached — you can create up to ${Ke} graph objects here. Delete one, or wait for the timer to reset.`,vo=`Demo limit reached — you can open up to ${Oa} project tabs here. Close one to open another.`,nr=new Set,Ra=new Set;function yo(){return nr.size}function $t(n){Ra.add(n),nr.add(n),Or()}function Lt(n){nr.delete(n)&&Or()}function Vt(n){Ra.has(n)&&(nr.add(n),Or())}function Ht(){return nr.size>=Ke}function wo(){return Ne.length>=Oa}function Ft(){return Co(),Aa(),new Error(`Demo object limit reached (${Ke}).`)}function ko(n){const r=n.settings||{presetName:"Untitled",paramDefs:[],edgeParamDefs:[]},t=ce();return{activePresetId:t,presets:[{id:t,name:r.presetName||"Untitled",isBuiltin:!1,createdAt:$n()}],paramDefs:Ye(r.paramDefs||[]),edgeParamDefs:Ye(r.edgeParamDefs||[])}}function ft(n,r){const t=new Map;return r.bookmarks&&t.set("canvas_bookmarks",r.bookmarks),r.graphNotes&&t.set("graph_notes",r.graphNotes),t.set("edge_routing_mode","waypoints"),t.set("snap_to_grid","false"),t.set("api_enabled","false"),{name:n,settings:ko(r),nodes:Ye(r.nodes||[]),edges:Ye(r.edges||[]),regions:Ye(r.regions||[]),app:t}}function jo(n,r){const t=mo[r];return ft(n,{settings:t||{presetName:"Blank",paramDefs:[],edgeParamDefs:[]},nodes:[],edges:[],regions:[]})}function le(){return Ne.map(n=>({...n,isActive:n.id===ve}))}function s0(){return ve&&xn[ve]?xn[ve]:{name:"",settings:{activePresetId:"",presets:[],paramDefs:[],edgeParamDefs:[]},nodes:[],edges:[],regions:[],app:new Map}}function ot(n,r,t){const s=ce();xn[s]=r,kr[s]=it(r);const a={id:s,name:n,savePath:t,order:bo++,isActive:!0,dirty:!1};return Ne.push(a),ve=s,a}ot("Payments platform architecture",ft("Payments platform architecture",$e["software-architecture"]),"demo://software-architecture");function br(n){return(n.split(/[\\/]/).pop()||n).trim()}function Jr(n,r,t){const s=new Blob([r],{type:t}),a=URL.createObjectURL(s),i=document.createElement("a");i.href=a,i.download=n,document.body.appendChild(i),i.click(),i.remove(),setTimeout(()=>URL.revokeObjectURL(a),1e3)}function No(){return new Promise(n=>{const r=document.createElement("input");r.type="file",r.accept=".glograph,application/json",r.onchange=()=>{const s=r.files&&r.files[0];if(!s)return n(null);const a=new FileReader;a.onload=()=>{try{const i="upload://"+ce();jr[i]={name:s.name.replace(/\.glograph$/i,""),data:JSON.parse(String(a.result))},n(i)}catch{n(null)}},a.onerror=()=>n(null),a.readAsText(s)},r.click();const t=()=>{window.removeEventListener("focus",t),setTimeout(()=>{(!r.files||!r.files.length)&&n(null)},300)};window.addEventListener("focus",t)})}function za(n){return{version:8,exportedAt:$n(),settings:{presetName:n.settings.presets[0]?.name||"Untitled",paramDefs:n.settings.paramDefs,edgeParamDefs:n.settings.edgeParamDefs},nodes:n.nodes,edges:n.edges,regions:n.regions,bookmarks:n.app.get("canvas_bookmarks")??null,graphNotes:n.app.get("graph_notes")??null}}function bn(n){return Array.isArray(n)?"["+n.map(bn).join(",")+"]":n&&typeof n=="object"?"{"+Object.keys(n).sort().map(r=>JSON.stringify(r)+":"+bn(n[r])).join(",")+"}":JSON.stringify(n)}function it(n){const r=Ye(za(n));delete r.exportedAt;for(const t of["nodes","edges","regions"]){const s=r[t];if(Array.isArray(s)){for(const a of s)for(const i of["paramValues","links","media"])if(Array.isArray(a[i])){for(const l of a[i])delete l.id,delete l.nodeId,delete l.edgeId;a[i].sort((l,d)=>bn(l).localeCompare(bn(d)))}s.sort((a,i)=>bn(a).localeCompare(bn(i)))}}return bn(r)}const Te=n=>s0().nodes.find(r=>r.id===n),Yr=n=>s0().edges.find(r=>r.id===n),xr=n=>s0().regions.find(r=>r.id===n),rn=()=>s0().settings.paramDefs,tn=()=>s0().settings.edgeParamDefs;function Bt(n){return(n||"").toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")||"opt"}function vr(n){return n.reduce((r,t)=>Math.max(r,t.sortOrder??0),-1)+1}async function e0(n,r={}){return _o(n,r)}function _o(n,r){switch(n){case"get_build_info":return{version:"0.9.13",buildDate:"web demo"};case"log_frontend_error":return;case"get_tabs":return le();case"create_tab":return wo()?(Aa(vo),le()):(ot(r.name||"Untitled Project",jo(r.name||"Untitled Project",r.presetId),null),hn("tabs:changed",le()),le());case"switch_tab":return xn[r.id]&&(ve=r.id),hn("tabs:changed",le()),le();case"close_tab":return Ne=Ne.filter(t=>t.id!==r.id),delete xn[r.id],delete kr[r.id],ve===r.id&&(ve=Ne.length?Ne[Ne.length-1].id:null),hn("tabs:changed",le()),le();case"set_tab_dirty":{const t=Ne.find(s=>s.id===r.id);return t&&(t.dirty=r.dirty),le()}case"recompute_active_tab_dirty":{const t=Ne.find(s=>s.id===ve);return t&&ve&&(t.dirty=it(s0())!==kr[ve]),le()}case"rename_tab":{const t=Ne.find(s=>s.id===r.id);return t&&(t.name=r.name,xn[r.id]&&(xn[r.id].name=r.name)),hn("tabs:changed",le()),le()}case"set_tab_save_path":{const t=Ne.find(s=>s.id===r.id);return t&&(t.savePath=r.path),hn("tabs:changed",le()),le()}case"open_path_as_tab":{const t=Ne.find(i=>i.savePath===r.path);if(t)return ve=t.id,hn("tabs:changed",le()),le();let s,a;if(Rt[r.path]){s=Rt[r.path],a=br(r.path).replace("demo://","")||"Project";const i=zt.find(l=>l.path===r.path);i&&(a=i.name)}else jr[r.path]?(s=jr[r.path].data,a=jr[r.path].name):(s={settings:{presetName:"Project",paramDefs:[],edgeParamDefs:[]},nodes:[],edges:[],regions:[]},a="Project");return ot(a,ft(a,s),r.path),hn("tabs:changed",le()),le()}case"get_recent_projects":return zt;case"record_recent_project":return;case"remove_recent_project":return;case"get_graph_settings":return s0().settings;case"set_active_preset":return s0().settings;case"get_all_nodes":return s0().nodes.slice();case"get_all_edges":return s0().edges.slice();case"publish_change":return;case"read_local_file":return[];case"read_text_file_head":return"";case"extract_office_thumbnail":return null;case"trace":{if(!s0().nodes.some(t=>t.id===r.seedId))throw new Error(`Node '${r.seedId}' not found`);return fo(r.seedId,s0().edges,r.direction||"downstream")}case"get_all_regions":return s0().regions.slice();case"get_app_setting":return s0().app.get(r.key)??null;case"set_app_setting":s0().app.set(r.key,r.value);return;case"get_display_name":return At;case"set_display_name":At=(r.name||"").trim();return;case"get_lan_address":return"demo.local:57400";case"start_host_session":return 57400;case"stop_host_session":return;case"create_node":{if(Ht())throw Ft();const t=r.input,s={id:ce(),title:t.title??"",description:t.description??null,eventDate:t.eventDate??null,dateAdded:$n(),x:t.x??0,y:t.y??0,color:t.color??null,confidence:t.confidence??null,impactMagnitude:t.impactMagnitude??null,externalId:t.externalId??null,tags:t.tags??[],links:[],media:[],paramValues:(t.paramValues??[]).map(a=>({id:ce(),nodeId:"",paramDefId:a.paramDefId,value:a.value??null,isEnabled:a.isEnabled!==!1,showOnCard:!!a.showOnCard})),kind:t.kind??"standard",width:t.width??null,height:t.height??null,isPinned:!1,isExpandPinned:!1,zOrder:0};return s.paramValues.forEach(a=>a.nodeId=s.id),s0().nodes.push(s),$t(s.id),s}case"update_node":{const t=Te(r.input.id);if(!t)return t;const s=r.input;return["title","description","eventDate","color","confidence","impactMagnitude","kind"].forEach(a=>{s[a]!==void 0&&(t[a]=s[a])}),s.tags!==void 0&&(t.tags=s.tags),s.paramValues!==void 0&&(t.paramValues=s.paramValues.map(a=>({id:ce(),nodeId:t.id,paramDefId:a.paramDefId,value:a.value??null,isEnabled:a.isEnabled!==!1,showOnCard:!!a.showOnCard}))),t}case"restore_node":{const t=Ye(r.node),s=s0().nodes.findIndex(a=>a.id===t.id);return s>=0?s0().nodes[s]=t:s0().nodes.push(t),Vt(t.id),t}case"delete_node":{s0().nodes=s0().nodes.filter(t=>t.id!==r.id),s0().edges=s0().edges.filter(t=>t.sourceId!==r.id&&t.targetId!==r.id),Lt(r.id);return}case"update_node_positions":{(r.positions||[]).forEach(t=>{const s=Te(t.id);s&&(s.x=t.x,s.y=t.y)});return}case"add_node_link":{const t=r.input,s={id:ce(),nodeId:t.nodeId,url:t.url,label:t.label??null},a=Te(t.nodeId);return a&&a.links.push(s),s}case"delete_node_link":{s0().nodes.forEach(t=>t.links=t.links.filter(s=>s.id!==r.id));return}case"add_node_media":{const t=r.input,s={id:ce(),nodeId:t.nodeId,label:t.label??"",src:t.src,srcType:t.srcType,mediaType:t.mediaType,sortOrder:t.sortOrder??0,showOnCard:t.showOnCard!==!1},a=Te(t.nodeId);return a&&a.media.push(s),s}case"update_node_media":{let t=null;return s0().nodes.forEach(s=>s.media.forEach(a=>{a.id===r.id&&(a.label=r.label??"",a.src=r.src,a.srcType=r.srcType,t=a)})),t}case"update_node_media_show_on_card":{s0().nodes.forEach(t=>t.media.forEach(s=>{s.id===r.id&&(s.showOnCard=r.showOnCard)}));return}case"update_node_media_sort_order":{s0().nodes.forEach(t=>t.media.forEach(s=>{s.id===r.id&&(s.sortOrder=r.sortOrder)}));return}case"delete_node_media":{s0().nodes.forEach(t=>t.media=t.media.filter(s=>s.id!==r.id));return}case"set_node_pinned":{const t=Te(r.id);t&&(t.isPinned=r.pinned);return}case"set_node_expand_pinned":{const t=Te(r.id);t&&(t.isExpandPinned=r.expandPinned);return}case"set_node_z_order":{const t=Te(r.id);return t&&(t.zOrder=r.zOrder),t}case"set_node_size":{const t=Te(r.id);return t&&(t.width=r.width,t.height=r.height),t}case"set_node_render_markdown":{const t=Te(r.id);t&&(t.renderMarkdown=r.renderMarkdown);return}case"set_node_show_thumbnail":{const t=Te(r.id);t&&(t.showThumbnail=r.showThumbnail);return}case"create_edge":{const t=r.input;let s=t.sourceHandle??null,a=t.targetHandle??null;if(s==null&&a==null){const l=Te(t.sourceId),d=Te(t.targetId);if(l&&d){const[u,g]=ho(d.x+(d.width??200)/2-(l.x+(l.width??200)/2),d.y+(d.height??80)/2-(l.y+(l.height??80)/2));s=u,a=g}}const i={id:ce(),sourceId:t.sourceId,targetId:t.targetId,sourceHandle:s,targetHandle:a,waypoints:null,label:t.label??null,externalId:t.externalId??null,color:t.color??null,paramValues:(t.paramValues??[]).map(l=>({id:ce(),edgeId:"",paramDefId:l.paramDefId,value:l.value??null,isEnabled:l.isEnabled!==!1}))};return i.paramValues.forEach(l=>l.edgeId=i.id),s0().edges.push(i),i}case"update_edge":{const t=Yr(r.input.id);if(!t)return t;const s=r.input;return s.label!==void 0&&(t.label=s.label),s.color!==void 0&&(t.color=s.color),s.externalId!==void 0&&(t.externalId=s.externalId),s.paramValues!==void 0&&(t.paramValues=s.paramValues.map(a=>({id:ce(),edgeId:t.id,paramDefId:a.paramDefId,value:a.value??null,isEnabled:a.isEnabled!==!1}))),t}case"update_edge_waypoints":{const t=Yr(r.input.id);return t&&(t.waypoints=r.input.waypoints??null),t}case"reconnect_edge":{const t=Yr(r.id);return t&&(t.sourceId=r.sourceId,t.targetId=r.targetId,t.sourceHandle=r.sourceHandle??null,t.targetHandle=r.targetHandle??null),t}case"restore_edge":{const t=Ye(r.edge),s=s0().edges.findIndex(a=>a.id===t.id);return s>=0?s0().edges[s]=t:s0().edges.push(t),t}case"delete_edge":{s0().edges=s0().edges.filter(t=>t.id!==r.id);return}case"create_region":{if(Ht())throw Ft();const t=r.input,s={id:ce(),title:t.title??"Region",x:t.x??0,y:t.y??0,width:t.width??320,height:t.height??220,color:t.color??null,zOrder:0,isLocked:!1,isMinimized:!1,createdAt:$n()};return s0().regions.push(s),$t(s.id),s}case"update_region":{const t=xr(r.input.id);if(!t)return t;const s=r.input;return["title","x","y","width","height","color"].forEach(a=>{s[a]!==void 0&&(t[a]=s[a])}),t}case"restore_region":{const t=Ye(r.region),s=s0().regions.findIndex(a=>a.id===t.id);return s>=0?s0().regions[s]=t:s0().regions.push(t),Vt(t.id),t}case"delete_region":{s0().regions=s0().regions.filter(t=>t.id!==r.id),Lt(r.id);return}case"set_region_z_order":{const t=xr(r.id);return t&&(t.zOrder=r.zOrder),t}case"set_region_locked":{const t=xr(r.id);return t&&(t.isLocked=r.locked),t}case"set_region_minimized":{const t=xr(r.id);return t&&(t.isMinimized=r.minimized),t}case"create_node_param_def":{const t=r.input;return rn().push({id:ce(),presetId:s0().settings.activePresetId,displayName:t.displayName,paramType:t.paramType||"text",defaultValue:t.defaultValue??null,drivesColor:!1,showOnCardDefault:!1,sortOrder:vr(rn()),options:[]}),s0().settings}case"update_node_param_def":{const t=rn().find(s=>s.id===r.input.id);if(t){const s=r.input;s.displayName!==void 0&&(t.displayName=s.displayName),s.paramType!==void 0&&(t.paramType=s.paramType),s.defaultValue!==void 0&&(t.defaultValue=s.defaultValue)}return s0().settings}case"delete_node_param_def":return s0().settings.paramDefs=rn().filter(t=>t.id!==r.id),s0().nodes.forEach(t=>t.paramValues=t.paramValues.filter(s=>s.paramDefId!==r.id)),s0().settings;case"set_drives_color":return rn().forEach(t=>t.drivesColor=t.id===r.id),s0().settings;case"create_param_option":{const t=r.input,s=rn().find(a=>a.id===t.paramDefId);return s&&s.options.push({id:ce(),paramDefId:s.id,valueSlug:Bt(t.label),label:t.label,color:t.color??null,sortOrder:vr(s.options)}),s0().settings}case"update_param_option":return rn().forEach(t=>t.options.forEach(s=>{s.id===r.input.id&&(r.input.label!==void 0&&(s.label=r.input.label),r.input.color!==void 0&&(s.color=r.input.color))})),s0().settings;case"delete_param_option":return rn().forEach(t=>t.options=t.options.filter(s=>s.id!==r.id)),s0().settings;case"create_edge_param_def":{const t=r.input;return tn().push({id:ce(),presetId:s0().settings.activePresetId,displayName:t.displayName,paramType:t.paramType||"text",defaultValue:t.defaultValue??null,drivesArrow:!1,drivesStyle:!1,drivesColor:!1,drivesWidth:!1,sortOrder:vr(tn()),options:[]}),s0().settings}case"update_edge_param_def":{const t=tn().find(s=>s.id===r.input.id);if(t){const s=r.input;s.displayName!==void 0&&(t.displayName=s.displayName),s.paramType!==void 0&&(t.paramType=s.paramType),s.defaultValue!==void 0&&(t.defaultValue=s.defaultValue)}return s0().settings}case"delete_edge_param_def":return s0().settings.edgeParamDefs=tn().filter(t=>t.id!==r.id),s0().edges.forEach(t=>t.paramValues=t.paramValues.filter(s=>s.paramDefId!==r.id)),s0().settings;case"set_edge_drive":{const t={arrow:"drivesArrow",style:"drivesStyle",color:"drivesColor",width:"drivesWidth"}[r.drive];return t&&tn().forEach(s=>s[t]=s.id===r.id),s0().settings}case"create_edge_param_option":{const t=r.input,s=tn().find(a=>a.id===t.paramDefId);return s&&s.options.push({id:ce(),paramDefId:s.id,valueSlug:Bt(t.label),label:t.label,color:t.color??null,sortOrder:vr(s.options)}),s0().settings}case"update_edge_param_option":return tn().forEach(t=>t.options.forEach(s=>{s.id===r.input.id&&(r.input.label!==void 0&&(s.label=r.input.label),r.input.color!==void 0&&(s.color=r.input.color))})),s0().settings;case"delete_edge_param_option":return tn().forEach(t=>t.options=t.options.filter(s=>s.id!==r.id)),s0().settings;case"create_preset":{const t={id:ce(),name:r.input.name,isBuiltin:!1,createdAt:$n()};return s0().settings.presets.push(t),s0().settings.activePresetId=t.id,s0().settings}case"duplicate_preset":{const t={id:ce(),name:r.input.newName,isBuiltin:!1,createdAt:$n()};return s0().settings.presets.push(t),s0().settings.activePresetId=t.id,s0().settings}case"rename_preset":{const t=s0().settings.presets.find(s=>s.id===r.input.id);return t&&(t.name=r.input.newName),s0().settings}case"delete_preset":return s0().settings.presets=s0().settings.presets.filter(t=>t.id!==r.id),s0().settings;case"new_graph":{s0().nodes=[],s0().edges=[],s0().regions=[];return}case"save_graph_to_path":{if(Jr(Io(br(r.path),"glograph"),JSON.stringify(za(s0()),null,2),"application/json"),ve){kr[ve]=it(s0());const t=Ne.find(s=>s.id===ve);t&&(t.dirty=!1)}return r.path}case"write_text_file":{Jr(br(r.path),r.content,"text/plain");return}case"write_binary_file":{Jr(br(r.path),new Uint8Array(r.bytes),"application/octet-stream");return}default:console.warn("[demo] unhandled command:",n);return}}function Io(n,r){return n.toLowerCase().endsWith("."+r)?n:n+"."+r}let Ze=null,Nr=null,An=null,Qr=null;const Xr="gg_demo_deadline";function Aa(n=Pa){if(!An)return;const r=An.querySelector(".demo-limit__msg");r&&(r.textContent=n),An.classList.add("demo-limit--show"),Qr&&clearTimeout(Qr),Qr=setTimeout(()=>An&&An.classList.remove("demo-limit--show"),6e3)}function Or(){if(!Ze)return;const n=yo();Ze.querySelector(".demo-badge__val").textContent=`${n} / ${Ke}`,Ze.classList.toggle("demo-badge--warn",n>=Math.ceil(Ke*.7)&&n<Ke),Ze.classList.toggle("demo-badge--full",n>=Ke)}function Co(){Ze&&(Ze.classList.remove("demo-badge--flash"),Ze.offsetWidth,Ze.classList.add("demo-badge--flash"))}function So(){let n=Number(sessionStorage.getItem(Xr)||0);if(!n||n<=Date.now()){n=Date.now()+xo;try{sessionStorage.setItem(Xr,String(n))}catch{}}const r=()=>{const t=n-Date.now();if(t<=0){try{sessionStorage.removeItem(Xr)}catch{}location.reload();return}if(Nr){const s=Math.floor(t/6e4),a=Math.floor(t%6e4/1e3);Nr.querySelector(".demo-badge__val").textContent=`${s}:${String(a).padStart(2,"0")}`,Nr.classList.toggle("demo-badge--warn",t<=2*6e4)}};r(),setInterval(r,1e3)}function Eo(){if(typeof document>"u")return;const n=()=>{if(document.getElementById("demo-chrome"))return;document.documentElement.classList.add("demo-framed");const r=document.createElement("style");r.textContent=`
      /* Stack the site header above the app and let the app fill the rest. */
      html.demo-framed, html.demo-framed body { height: 100%; }
      html.demo-framed body { display: flex; flex-direction: column; overflow: hidden; }
      html.demo-framed #root { flex: 1 1 auto; min-height: 0; height: auto; overflow: hidden; }
      html.demo-framed .app, html.demo-framed .app-loading { height: 100%; }
      html.demo-framed .sidebar, html.demo-framed .detail-panel { height: 100%; }

      /* Founder's deal strip — same as the marketing site (styles.css .founder-banner). */
      .founder-banner {
        flex: 0 0 auto; display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap;
        background: var(--accent-dim, #6e4c00); border-bottom: 1px solid var(--border-lo, #0c0c0c);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        padding: 7px 16px; font-size: 13px; color: #f0dcb0;
        font-family: 'IBM Plex Sans', 'Segoe UI', Tahoma, system-ui, sans-serif;
      }
      .founder-banner__tag {
        font-family: 'IBM Plex Mono', Consolas, monospace; font-size: 10px; font-weight: 700; letter-spacing: 1px;
        background: var(--accent, #ffb000); color: #1a1200; padding: 2px 7px; border-radius: 1px;
      }
      .founder-banner__text { max-width: 100%; overflow-wrap: break-word; }
      .founder-banner__text strong { color: #fff; }
      .founder-banner__link { color: var(--accent, #ffb000); font-weight: 700; white-space: nowrap; text-decoration: none; }
      .founder-banner__link:hover { text-decoration: underline; }

      /* The demo header is the SAME as the marketing site nav (styles.css .nav),
         replicated here because the SPA doesn't load styles.css, plus the demo
         badges. Scoped to .nav / .nav__cta so it never collides with the app's .btn. */
      .nav {
        flex: 0 0 auto; position: relative; z-index: 200;
        display: flex; align-items: center; gap: 24px; padding: 10px 24px;
        background: var(--surface, #212121);
        border-bottom: 1px solid var(--border-lo, #0c0c0c);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
      }
      .nav__brand {
        font-family: 'IBM Plex Mono', Consolas, 'Cascadia Code', monospace;
        font-weight: 700; letter-spacing: 2px; font-size: 18px; color: var(--text, #ccc); text-decoration: none;
      }
      .nav__brand:hover { text-decoration: none; }
      .nav__links { display: flex; gap: 20px; margin-left: auto; }
      .nav__links a {
        color: var(--text-muted, #888); font-size: 13px; font-weight: 500;
        font-family: 'IBM Plex Mono', Consolas, 'Cascadia Code', monospace;
        text-transform: uppercase; letter-spacing: 0.6px; text-decoration: none;
      }
      .nav__links a:hover { color: var(--text, #ccc); text-decoration: none; }
      .nav__cta {
        display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        font-family: 'IBM Plex Mono', Consolas, 'Cascadia Code', monospace;
        font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px;
        padding: 8px 16px; min-height: 32px; white-space: nowrap;
        background: var(--accent, #ffb000); color: #1a1200;
        border: 1px solid; border-color: #ffc94d var(--border-lo,#0c0c0c) var(--border-lo,#0c0c0c) #ffc94d;
        border-radius: 1px; text-decoration: none; cursor: pointer; transition: background .15s ease;
      }
      .nav__cta:hover { background: #ffbf2e; text-decoration: none; }
      .demo-badges { display: flex; align-items: center; gap: 8px; }
      .demo-badge {
        display: inline-flex; align-items: center; gap: 6px; height: 24px; padding: 0 9px;
        font-family: Consolas, 'Cascadia Code', monospace; font-size: 11px; font-variant-numeric: tabular-nums;
        color: var(--text-muted, #888); background: var(--surface-2, #2a2a2a);
        border: 1px solid; border-color: var(--border-hi,#6a6a6a) var(--border-lo,#0c0c0c) var(--border-lo,#0c0c0c) var(--border-hi,#6a6a6a);
        border-radius: 1px; white-space: nowrap;
      }
      .demo-badge__lbl { color: var(--text-dim, #545454); text-transform: uppercase; letter-spacing: 0.5px; font-size: 9px; }
      .demo-badge__val { color: var(--text, #ccc); }
      .demo-badge__ic { color: var(--accent, #ffb000); display: inline-flex; }
      .demo-badge--warn { border-color: var(--warn,#c97a1a); }
      .demo-badge--warn .demo-badge__val, .demo-badge--warn .demo-badge__ic { color: var(--warn,#c97a1a); }
      .demo-badge--full { border-color: var(--danger,#c83030); }
      .demo-badge--full .demo-badge__val, .demo-badge--full .demo-badge__ic { color: var(--danger,#c83030); }
      .demo-badge--flash { animation: demo-badge-flash 0.6s ease-out; }
      @keyframes demo-badge-flash {
        0% { box-shadow: 0 0 0 0 rgba(200,48,48,0.8); }
        100% { box-shadow: 0 0 0 8px rgba(200,48,48,0); }
      }
      @media (max-width: 860px) { .nav__links { display: none; } }

      /* Inline limit notice (anchored bar under the header, not a toast). */
      .demo-limit {
        position: fixed; top: 84px; left: 50%; z-index: 6000;
        display: flex; align-items: center; gap: 8px; max-width: 540px;
        padding: 8px 8px 8px 12px;
        background: var(--surface-2, #2a2a2a); color: var(--text, #ccc);
        border: 1px solid; border-color: var(--border-hi,#6a6a6a) var(--border-lo,#0c0c0c) var(--border-lo,#0c0c0c) var(--border-hi,#6a6a6a);
        border-left: 3px solid var(--danger, #c83030);
        box-shadow: 0 6px 20px rgba(0,0,0,0.5);
        font-family: 'Segoe UI', Tahoma, system-ui, sans-serif; font-size: 12px; line-height: 1.4;
        opacity: 0; pointer-events: none;
        transform: translateX(-50%) translateY(-8px);
        transition: opacity .15s ease, transform .15s ease;
      }
      .demo-limit--show { opacity: 1; pointer-events: auto; transform: translateX(-50%) translateY(0); }
      .demo-limit__ic { color: var(--danger, #c83030); flex-shrink: 0; }
      .demo-limit__x {
        flex-shrink: 0; background: transparent; border: none; color: var(--text-muted, #888);
        cursor: pointer; font-size: 13px; line-height: 1; padding: 2px 4px;
      }
      .demo-limit__x:hover { color: var(--text, #ccc); }

      /* "? Tutorial" badge-button (lives in the demo-only badge cluster). */
      .demo-badge--btn { cursor: pointer; font-family: Consolas, 'Cascadia Code', monospace; }
      .demo-badge--btn:hover { color: var(--text, #ccc); border-color: var(--border-strong, #585858); }

      /* Tutorial modal (app modal aesthetic). */
      .dtut-backdrop {
        display: none; position: fixed; inset: 0; z-index: 8000;
        background: rgba(0,0,0,0.72); align-items: flex-start; justify-content: center; padding-top: 64px;
        font-family: 'Segoe UI', Tahoma, system-ui, sans-serif;
      }
      .dtut-backdrop--open { display: flex; }
      .dtut-panel {
        background: var(--surface, #212121); width: 480px; max-width: calc(100vw - 32px); max-height: calc(100vh - 128px);
        border: 1px solid; border-color: var(--border-hi,#6a6a6a) var(--border-lo,#0c0c0c) var(--border-lo,#0c0c0c) var(--border-hi,#6a6a6a);
        box-shadow: 0 12px 40px rgba(0,0,0,0.5); display: flex; flex-direction: column;
      }
      .dtut-header {
        align-items: center; background: #363636; border-bottom: 1px solid var(--border-lo,#0c0c0c);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 0 var(--border,#484848);
        display: flex; flex-shrink: 0; gap: 8px; padding: 9px 12px;
      }
      .dtut-header h2 { color: var(--text,#ccc); flex: 1; font-size: 13px; font-weight: 600; margin: 0; }
      .dtut-close { background: transparent; border: none; color: var(--text-muted,#888); cursor: pointer; font-size: 16px; line-height: 1; padding: 2px 4px; }
      .dtut-close:hover { color: var(--text,#ccc); }
      .dtut-body { display: flex; flex-direction: column; gap: 12px; overflow-y: auto; padding: 16px; }
      .dtut-intro { color: var(--text-muted,#888); font-size: 13px; margin: 0 0 2px; line-height: 1.45; }
      .dtut-intro b { color: var(--accent,#ffb000); font-weight: 600; }
      .dtut-step { display: flex; gap: 12px; align-items: flex-start; }
      .dtut-step__ic {
        align-items: center; background: var(--bg,#171717); border: 1px solid var(--border-subtle,#1c1c1c);
        box-shadow: inset 0 1px 4px rgba(0,0,0,0.55); color: var(--accent,#ffb000);
        display: flex; flex-shrink: 0; height: 34px; justify-content: center; width: 34px;
      }
      .dtut-step__t { color: var(--text,#ccc); font-size: 13px; font-weight: 600; }
      .dtut-step__d { color: var(--text-muted,#888); font-size: 12px; line-height: 1.45; margin-top: 1px; }
      .dtut-footer {
        align-items: center; background: #141414; border-top: 1px solid var(--border-lo,#0c0c0c);
        box-shadow: inset 0 1px 0 var(--border-subtle,#1c1c1c);
        display: flex; flex-shrink: 0; gap: 8px; justify-content: space-between; padding: 10px 12px;
      }
      .dtut-btn {
        font-family: 'Segoe UI', Tahoma, system-ui, sans-serif; font-size: 12px; font-weight: 600;
        padding: 7px 14px; min-height: 30px; border-radius: 1px; cursor: pointer;
        border: 1px solid; border-color: var(--border-hi,#6a6a6a) var(--border-lo,#0c0c0c) var(--border-lo,#0c0c0c) var(--border-hi,#6a6a6a);
        background: var(--surface-2,#2a2a2a); color: var(--text,#ccc);
      }
      .dtut-btn:hover { background: var(--surface-3,#353535); }
      .dtut-btn--primary { background: var(--accent,#ffb000); color: #1a1200; font-weight: 700; border-color: #ffc94d var(--border-lo,#0c0c0c) var(--border-lo,#0c0c0c) #ffc94d; }
      .dtut-btn--primary:hover { background: #ffbf2e; }

      /* Mobile: the demo is the full desktop workstation — replace it with a
         fallback rather than cram React Flow + three panels onto a phone. */
      .demo-mobile {
        display: none; flex-direction: column; align-items: center; text-align: center;
        gap: 14px; padding: 28px 20px; overflow-y: auto;
        font-family: 'Segoe UI', Tahoma, system-ui, sans-serif; color: var(--text,#ccc);
      }
      .demo-mobile__kicker { font-family: 'IBM Plex Mono', Consolas, monospace; font-size: 11px; font-weight: 700; letter-spacing: 1.4px; text-transform: uppercase; color: var(--accent,#ffb000); max-width: 100%; }
      .demo-mobile h2 { font-size: 22px; margin: 0; color: var(--text,#ccc); max-width: 100%; overflow-wrap: break-word; }
      .demo-mobile p { color: var(--text-muted,#888); font-size: 14px; line-height: 1.5; max-width: 38ch; margin: 0; }
      .demo-mobile p strong { color: var(--text,#ccc); }
      .demo-mobile__shot { width: 100%; max-width: 440px; height: auto; border: 1px solid; border-color: var(--border-hi,#6a6a6a) var(--border-lo,#0c0c0c) var(--border-lo,#0c0c0c) var(--border-hi,#6a6a6a); }
      .demo-mobile__btn {
        margin-top: 6px; display: inline-flex; align-items: center; padding: 10px 18px;
        background: var(--accent,#ffb000); color: #1a1200; font-weight: 700; text-decoration: none;
        border: 1px solid; border-color: #ffc94d var(--border-lo,#0c0c0c) var(--border-lo,#0c0c0c) #ffc94d;
        border-radius: 1px; font-family: 'IBM Plex Mono', Consolas, monospace; letter-spacing: 0.5px;
      }
      @media (max-width: 760px) {
        html.demo-framed, html.demo-framed body { max-width: 100%; overflow-x: hidden; }
        html.demo-framed #root { display: none; }
        .demo-badges { display: none; }
        .demo-limit { display: none !important; }
        .demo-mobile { display: flex; flex: 1 1 auto; min-height: 0; }
        .founder-banner { display: none; }   /* drop the promo strip on phones */
        .nav { padding: 10px 14px; gap: 12px; }
        .nav__cta { margin-left: auto; }
      }
    `,document.head.appendChild(r);const t=document.createElement("link");t.rel="stylesheet",t.href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap",document.head.appendChild(t);const s=document.createElement("header");s.id="demo-chrome",s.className="nav",s.innerHTML=`
      <a class="nav__brand" href="/" title="GloGraph home">GLOGRAPH</a>
      <nav class="nav__links">
        <a href="/#why">Why</a>
        <a href="/#features">Features</a>
        <a href="/#sdk">SDK</a>
        <a href="/demo/">Demo</a>
        <a href="/#gallery">Gallery</a>
        <a href="/#plans">Plans</a>
        <a href="/#faq">FAQ</a>
      </nav>
      <div class="demo-badges">
        <button class="demo-badge demo-badge--btn" id="demo-help" title="Show the demo tutorial">? Tutorial</button>
        <span class="demo-badge" id="demo-badge-objects" title="Graph objects you can create in the demo">
          <span class="demo-badge__ic">▪</span><span class="demo-badge__lbl">objects</span><span class="demo-badge__val">0 / ${Ke}</span>
        </span>
        <span class="demo-badge" id="demo-badge-timer" title="The demo resets when this reaches 0:00">
          <span class="demo-badge__ic">⏱</span><span class="demo-badge__lbl">resets in</span><span class="demo-badge__val">30:00</span>
        </span>
      </div>
      <a class="nav__cta" href="/#notify">Get early access</a>
    `;const a=document.createElement("div");a.className="founder-banner",a.innerHTML=`
      <span class="founder-banner__tag">EARLY ACCESS</span>
      <span class="founder-banner__text">GloGraph is in beta. Join the list for early access and launch updates.</span>
      <a href="/#notify" class="founder-banner__link">Join the list →</a>
    `,document.body.insertBefore(a,document.body.firstChild),document.body.insertBefore(s,a.nextSibling);const i=document.createElement("div");i.id="demo-limit",i.className="demo-limit",i.innerHTML=`
      <span class="demo-limit__ic" aria-hidden>▲</span>
      <span class="demo-limit__msg">${Pa}</span>
      <button class="demo-limit__x" aria-label="Dismiss">✕</button>
    `,document.body.appendChild(i),An=i,i.querySelector(".demo-limit__x").addEventListener("click",()=>i.classList.remove("demo-limit--show"));const l=document.createElement("div");l.className="demo-mobile",l.innerHTML=`
      <div class="demo-mobile__kicker">:: Live demo ::</div>
      <h2>Best on a bigger screen</h2>
      <p>The GloGraph demo is the full desktop workstation — dense docked panels, drag-to-connect, a graph canvas. It wants a mouse and some room. Open <strong>glograph.com/demo</strong> on a computer to try it.</p>
      <img class="demo-mobile__shot" src="/assets/macro-economics-demo.png" alt="A GloGraph causal map: typed nodes and colored, labeled edges." />
      <a class="demo-mobile__btn" href="/">Back to home</a>
    `,document.body.appendChild(l),Ze=s.querySelector("#demo-badge-objects"),Nr=s.querySelector("#demo-badge-timer"),Or(),So(),Do(s.querySelector("#demo-help"))};document.body?n():document.addEventListener("DOMContentLoaded",n)}function Do(n){const r="glograph_demo_tutorial_dismissed",t=u=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${u}</svg>`,s=[['<polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/>',"Move a node","Drag any node card to reposition it on the canvas."],['<path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/>',"Expand & keep open","Hover a node to reveal its details. Click the chevron in its title row to keep it expanded."],['<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',"Pin a position","Click the pin in a node's title row to lock it in place so it won't drag."],['<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/>',"Inspect","Click any node or region to open the detail panel on the right, with its parameters and connections."],['<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',"Group with regions","Lock or minimize a region from its header to group its nodes or collapse it. Captured nodes show a lock badge."],['<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/>',"Navigate","Drag the canvas to pan, scroll to zoom. Use the sidebar tree and search, or open your own .glograph from the File menu."]],a=document.createElement("div");a.className="dtut-backdrop",a.innerHTML=`
    <div class="dtut-panel" role="dialog" aria-modal="true" aria-label="Demo tutorial">
      <div class="dtut-header"><h2>Welcome to the GloGraph demo</h2><button class="dtut-close" aria-label="Close">✕</button></div>
      <div class="dtut-body">
        <p class="dtut-intro">This is the real GloGraph app, running in your browser. Edit freely — you can create up to <b>${Ke} objects</b>, nothing is saved, and it <b>resets every 30 minutes</b>.</p>
        ${s.map(u=>`<div class="dtut-step"><span class="dtut-step__ic">${t(u[0])}</span><div><div class="dtut-step__t">${u[1]}</div><div class="dtut-step__d">${u[2]}</div></div></div>`).join("")}
      </div>
      <div class="dtut-footer"><button class="dtut-btn" data-act="skip">Skip tutorial</button><button class="dtut-btn dtut-btn--primary" data-act="ok">Got it</button></div>
    </div>`,document.body.appendChild(a);const i=()=>a.classList.add("dtut-backdrop--open"),l=()=>{a.classList.remove("dtut-backdrop--open");try{localStorage.setItem(r,"1")}catch{}};a.querySelector(".dtut-close").addEventListener("click",l),a.querySelectorAll("[data-act]").forEach(u=>u.addEventListener("click",l)),a.addEventListener("click",u=>{u.target===a&&l()}),window.addEventListener("keydown",u=>{u.key==="Escape"&&a.classList.contains("dtut-backdrop--open")&&l()}),n&&n.addEventListener("click",i);let d=!1;try{d=localStorage.getItem(r)==="1"}catch{}!d&&window.innerWidth>760&&i()}Eo();function $a(n,r){return Promise.resolve(go(n,r))}async function Yn(n={}){const r=n.defaultPath?String(n.defaultPath):"graph";return r.toLowerCase().endsWith(".glograph")?r:r+".glograph"}async function Qn(n={}){return No()}const La=(...n)=>n.filter((r,t,s)=>!!r&&r.trim()!==""&&s.indexOf(r)===t).join(" ").trim();const To=n=>n.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();const Mo=n=>n.replace(/^([A-Z])|[\s-_]+(\w)/g,(r,t,s)=>s?s.toUpperCase():t.toLowerCase());const Wt=n=>{const r=Mo(n);return r.charAt(0).toUpperCase()+r.slice(1)};var et={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};const Oo=n=>{for(const r in n)if(r.startsWith("aria-")||r==="role"||r==="title")return!0;return!1},Po=o.createContext({}),Ro=()=>o.useContext(Po),zo=o.forwardRef(({color:n,size:r,strokeWidth:t,absoluteStrokeWidth:s,className:a="",children:i,iconNode:l,...d},u)=>{const{size:g=24,strokeWidth:h=2,absoluteStrokeWidth:c=!1,color:b="currentColor",className:x=""}=Ro()??{},m=s??c?Number(t??h)*24/Number(r??g):t??h;return o.createElement("svg",{ref:u,...et,width:r??g??et.width,height:r??g??et.height,stroke:n??b,strokeWidth:m,className:La("lucide",x,a),...!i&&!Oo(d)&&{"aria-hidden":"true"},...d},[...l.map(([k,w])=>o.createElement(k,w)),...Array.isArray(i)?i:[i]])});const l0=(n,r)=>{const t=o.forwardRef(({className:s,...a},i)=>o.createElement(zo,{ref:i,iconNode:r,className:La(`lucide-${To(Wt(n))}`,`lucide-${n}`,s),...a}));return t.displayName=Wt(n),t};const Ao=[["path",{d:"M12 5v14",key:"s699le"}],["path",{d:"m19 12-7 7-7-7",key:"1idqje"}]],$o=l0("arrow-down",Ao);const Lo=[["path",{d:"M8 3 4 7l4 4",key:"9rb6wj"}],["path",{d:"M4 7h16",key:"6tx8e3"}],["path",{d:"m16 21 4-4-4-4",key:"siv7j2"}],["path",{d:"M20 17H4",key:"h6l3hr"}]],Vo=l0("arrow-left-right",Lo);const Ho=[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]],Va=l0("arrow-left",Ho);const Fo=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]],Ir=l0("arrow-right",Fo);const Bo=[["path",{d:"m5 12 7-7 7 7",key:"hav0vg"}],["path",{d:"M12 19V5",key:"x0mq9r"}]],Wo=l0("arrow-up",Bo);const Uo=[["path",{d:"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z",key:"oz39mx"}]],Go=l0("bookmark",Uo);const qo=[["rect",{x:"8",y:"8",width:"8",height:"8",rx:"2",key:"yj20xf"}],["path",{d:"M4 10a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2",key:"1ltk23"}],["path",{d:"M14 20a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2",key:"1q24h9"}]],Ha=l0("bring-to-front",qo);const Ko=[["path",{d:"M5 21v-6",key:"1hz6c0"}],["path",{d:"M12 21V3",key:"1lcnhd"}],["path",{d:"M19 21V9",key:"unv183"}]],Zo=l0("chart-no-axes-column",Ko);const Jo=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],Qe=l0("check",Jo);const Yo=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],Ae=l0("chevron-down",Yo);const Qo=[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]],Xo=l0("chevron-left",Qo);const ei=[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]],Le=l0("chevron-right",ei);const ni=[["path",{d:"m18 15-6-6-6 6",key:"153udz"}]],ri=l0("chevron-up",ni);const ti=[["path",{d:"m7 20 5-5 5 5",key:"13a0gw"}],["path",{d:"m7 4 5 5 5-5",key:"1kwcof"}]],ai=l0("chevrons-down-up",ti);const si=[["path",{d:"m7 15 5 5 5-5",key:"1hf1tw"}],["path",{d:"m7 9 5-5 5 5",key:"sgt6xg"}]],oi=l0("chevrons-up-down",si);const ii=[["path",{d:"M11 14h10",key:"1w8e9d"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v1.344",key:"1e62lh"}],["path",{d:"m17 18 4-4-4-4",key:"z2g111"}],["path",{d:"M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 1.793-1.113",key:"bjbb7m"}],["rect",{x:"8",y:"2",width:"8",height:"4",rx:"1",key:"ublpy"}]],di=l0("clipboard-paste",ii);const li=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 6v6l4 2",key:"mmk7yg"}]],ci=l0("clock",li);const ui=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],jn=l0("copy",ui);const pi=[["path",{d:"M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z",key:"1ptgy4"}],["path",{d:"M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97",key:"1sl1rz"}]],Ut=l0("droplets",pi);const mi=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]],dt=l0("external-link",mi);const fi=[["path",{d:"M13.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v11.5",key:"4pqfef"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M8 12v-1",key:"1ej8lb"}],["path",{d:"M8 18v-2",key:"qcmpov"}],["path",{d:"M8 7V6",key:"1nbb54"}],["circle",{cx:"8",cy:"20",r:"2",key:"ckkr5m"}]],hi=l0("file-archive",fi);const gi=[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["circle",{cx:"10",cy:"12",r:"2",key:"737tya"}],["path",{d:"m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22",key:"wt3hpn"}]],bi=l0("file-image",gi);const xi=[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M8 13h2",key:"yr2amv"}],["path",{d:"M14 13h2",key:"un5t4a"}],["path",{d:"M8 17h2",key:"2yhykz"}],["path",{d:"M14 17h2",key:"10kma7"}]],vi=l0("file-spreadsheet",xi);const yi=[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]],_r=l0("file-text",yi);const wi=[["path",{d:"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",key:"1oefj6"}],["path",{d:"M14 2v5a1 1 0 0 0 1 1h5",key:"wfsgrz"}]],Xn=l0("file",wi);const ki=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M7 3v18",key:"bbkbws"}],["path",{d:"M3 7.5h4",key:"zfgn84"}],["path",{d:"M3 12h18",key:"1i2n21"}],["path",{d:"M3 16.5h4",key:"1230mu"}],["path",{d:"M17 3v18",key:"in4fa5"}],["path",{d:"M17 7.5h4",key:"myr1c1"}],["path",{d:"M17 16.5h4",key:"go4c1d"}]],on=l0("film",ki);const ji=[["path",{d:"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",key:"usdka0"}]],lt=l0("folder-open",ji);const Ni=[["path",{d:"M10.7 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v4.1",key:"1bw5m7"}],["path",{d:"m21 21-1.9-1.9",key:"1g2n9r"}],["circle",{cx:"17",cy:"17",r:"3",key:"18b49y"}]],_i=l0("folder-search",Ni);const Ii=[["path",{d:"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",key:"sc7q7i"}]],Ci=l0("funnel",Ii);const Si=[["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}],["path",{d:"M10.41 10.41a2 2 0 1 1-2.83-2.83",key:"1bzlo9"}],["line",{x1:"13.5",x2:"6",y1:"13.5",y2:"21",key:"1q0aeu"}],["line",{x1:"18",x2:"21",y1:"12",y2:"15",key:"5mozeu"}],["path",{d:"M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59",key:"mmje98"}],["path",{d:"M21 15V5a2 2 0 0 0-2-2H9",key:"43el77"}]],Ei=l0("image-off",Si);const Di=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",ry:"2",key:"1m3agn"}],["circle",{cx:"9",cy:"9",r:"2",key:"af1f0g"}],["path",{d:"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",key:"1xmnt7"}]],Je=l0("image",Di);const Ti=[["path",{d:"M9 17H7A5 5 0 0 1 7 7h2",key:"8i5ue5"}],["path",{d:"M15 7h2a5 5 0 1 1 0 10h-2",key:"1b9ql8"}],["line",{x1:"8",x2:"16",y1:"12",y2:"12",key:"1jonct"}]],Fa=l0("link-2",Ti);const Mi=[["path",{d:"M3 5h.01",key:"18ugdj"}],["path",{d:"M3 12h.01",key:"nlz23k"}],["path",{d:"M3 19h.01",key:"noohij"}],["path",{d:"M8 5h13",key:"1pao27"}],["path",{d:"M8 12h13",key:"1za7za"}],["path",{d:"M8 19h13",key:"m83p4d"}]],Oi=l0("list",Mi);const Pi=[["path",{d:"M12 2v4",key:"3427ic"}],["path",{d:"m16.2 7.8 2.9-2.9",key:"r700ao"}],["path",{d:"M18 12h4",key:"wj9ykh"}],["path",{d:"m16.2 16.2 2.9 2.9",key:"1bxg5t"}],["path",{d:"M12 18v4",key:"jadmvz"}],["path",{d:"m4.9 19.1 2.9-2.9",key:"bwix9q"}],["path",{d:"M2 12h4",key:"j09sii"}],["path",{d:"m4.9 4.9 2.9 2.9",key:"giyufr"}]],er=l0("loader",Pi);const Ri=[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 9.9-1",key:"1mm8w8"}]],Ba=l0("lock-open",Ri);const zi=[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]],Pr=l0("lock",zi);const Ai=[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"m21 3-7 7",key:"1l2asr"}],["path",{d:"m3 21 7-7",key:"tjx5ai"}],["path",{d:"M9 21H3v-6",key:"wtvkvv"}]],Wa=l0("maximize-2",Ai);const $i=[["path",{d:"M5 12h14",key:"1ays0h"}]],Cr=l0("minus",$i);const Li=[["circle",{cx:"8",cy:"18",r:"4",key:"1fc0mg"}],["path",{d:"M12 18V2l7 4",key:"g04rme"}]],wn=l0("music-2",Li);const Vi=[["rect",{x:"16",y:"16",width:"6",height:"6",rx:"1",key:"4q2zg0"}],["rect",{x:"2",y:"16",width:"6",height:"6",rx:"1",key:"8cvhb9"}],["rect",{x:"9",y:"2",width:"6",height:"6",rx:"1",key:"1egb70"}],["path",{d:"M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3",key:"1jsf9p"}],["path",{d:"M12 12V8",key:"2874zd"}]],Ua=l0("network",Vi);const Hi=[["path",{d:"M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z",key:"e79jfc"}],["circle",{cx:"13.5",cy:"6.5",r:".5",fill:"currentColor",key:"1okk4w"}],["circle",{cx:"17.5",cy:"10.5",r:".5",fill:"currentColor",key:"f64h9f"}],["circle",{cx:"6.5",cy:"12.5",r:".5",fill:"currentColor",key:"qy21gx"}],["circle",{cx:"8.5",cy:"7.5",r:".5",fill:"currentColor",key:"fotxhn"}]],Gt=l0("palette",Hi);const Fi=[["rect",{x:"14",y:"3",width:"5",height:"18",rx:"1",key:"kaeet6"}],["rect",{x:"5",y:"3",width:"5",height:"18",rx:"1",key:"1wsw3u"}]],Bi=l0("pause",Fi);const Wi=[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]],_n=l0("pencil",Wi);const Ui=[["path",{d:"M12 17v5",key:"bb1du9"}],["path",{d:"M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89",key:"znwnzq"}],["path",{d:"m2 2 20 20",key:"1ooewy"}],["path",{d:"M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11",key:"c9qhm2"}]],Ga=l0("pin-off",Ui);const Gi=[["path",{d:"M12 17v5",key:"bb1du9"}],["path",{d:"M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z",key:"1nkz8b"}]],qa=l0("pin",Gi);const qi=[["path",{d:"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",key:"10ikf1"}]],Ka=l0("play",qi);const Ki=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],oe=l0("plus",Ki);const Zi=[["path",{d:"M2 3h20",key:"91anmk"}],["path",{d:"M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3",key:"2k9sn8"}],["path",{d:"m7 21 5-5 5 5",key:"bip4we"}]],Ji=l0("presentation",Zi);const Yi=[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]],ct=l0("refresh-cw",Yi);const Qi=[["circle",{cx:"6",cy:"6",r:"3",key:"1lh9wr"}],["path",{d:"M8.12 8.12 12 12",key:"1alkpv"}],["path",{d:"M20 4 8.12 15.88",key:"xgtan2"}],["circle",{cx:"6",cy:"18",r:"3",key:"fqmcym"}],["path",{d:"M14.8 14.8 20 20",key:"ptml3r"}]],Xi=l0("scissors",Qi);const ed=[["path",{d:"m21 21-4.34-4.34",key:"14j7rj"}],["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}]],Za=l0("search",ed);const nd=[["rect",{x:"14",y:"14",width:"8",height:"8",rx:"2",key:"1b0bso"}],["rect",{x:"2",y:"2",width:"8",height:"8",rx:"2",key:"1x09vl"}],["path",{d:"M7 14v1a2 2 0 0 0 2 2h1",key:"pao6x6"}],["path",{d:"M14 7h1a2 2 0 0 1 2 2v1",key:"19tdru"}]],Ja=l0("send-to-back",nd);const rd=[["path",{d:"M14 21h1",key:"v9vybs"}],["path",{d:"M14 3h1",key:"1ec4yj"}],["path",{d:"M19 3a2 2 0 0 1 2 2",key:"18rm91"}],["path",{d:"M21 14v1",key:"169vum"}],["path",{d:"M21 19a2 2 0 0 1-2 2",key:"1j7049"}],["path",{d:"M21 9v1",key:"mxsmne"}],["path",{d:"M3 14v1",key:"vnatye"}],["path",{d:"M3 9v1",key:"1r0deq"}],["path",{d:"M5 21a2 2 0 0 1-2-2",key:"sbafld"}],["path",{d:"M5 3a2 2 0 0 0-2 2",key:"y57alp"}],["path",{d:"M7 12h10",key:"b7w52i"}],["path",{d:"M7 16h6",key:"1vyc9m"}],["path",{d:"M7 8h8",key:"1jbsf9"}],["path",{d:"M9 21h1",key:"15o7lz"}],["path",{d:"M9 3h1",key:"1yesri"}]],td=l0("square-dashed-text",rd);const ad=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}]],Ya=l0("square",ad);const sd=[["path",{d:"M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z",key:"1dfntj"}],["path",{d:"M15 3v5a1 1 0 0 0 1 1h5",key:"6s6qgf"}]],ht=l0("sticky-note",sd);const od=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],Ve=l0("trash-2",od);const id=[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",key:"wmoenq"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]],qt=l0("triangle-alert",id);const dd=[["path",{d:"M12 4v16",key:"1654pz"}],["path",{d:"M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2",key:"e0r10z"}],["path",{d:"M9 20h6",key:"s66wpe"}]],ld=l0("type",dd);const cd=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]],ud=l0("users",cd);const pd=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["path",{d:"M16 9a5 5 0 0 1 0 6",key:"1q6k2b"}],["path",{d:"M19.364 18.364a9 9 0 0 0 0-12.728",key:"ijwkga"}]],md=l0("volume-2",pd);const fd=[["path",{d:"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",key:"uqj9uw"}],["line",{x1:"22",x2:"16",y1:"9",y2:"15",key:"1ewh16"}],["line",{x1:"16",x2:"22",y1:"9",y2:"15",key:"5ykzw1"}]],hd=l0("volume-x",fd);const gd=[["circle",{cx:"12",cy:"5",r:"3",key:"rqqgnr"}],["path",{d:"M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.5A2 2 0 0 0 4 21h16a2 2 0 0 0 1.925-2.54L19.4 9.5A2 2 0 0 0 17.48 8Z",key:"56o5sh"}]],Kt=l0("weight",gd);const bd=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],S0=l0("x",bd);const xd=[["path",{d:"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",key:"1xq2db"}]],Zt=l0("zap",xd),Xe=200,en=80;function Hn(n,r){const t=n.x+(n.width??Xe)/2,s=n.y+(n.height??en)/2;return t>=r.x&&t<=r.x+r.width&&s>=r.y&&s<=r.y+r.height}function Qa(n,r){const t=n.width*n.height,s=r.width*r.height;if(t<=0||s<=t)return!1;const a=Math.max(n.x,r.x),i=Math.max(n.y,r.y),l=Math.min(n.x+n.width,r.x+r.width),d=Math.min(n.y+n.height,r.y+r.height);return l<=a||d<=i?!1:(l-a)*(d-i)/t>=.5}function vd(n){switch(n){case"note":return"note";case"image":return"image";case"video":return"video";case"audio":return"audio";default:return"node"}}function me(n){const r=n.title?.trim();if(r)return r;const t=n.media?.find(a=>a.label&&a.label.trim())?.label?.trim();if(t)return t;const s=n.description?.split(`
`).map(a=>a.trim()).find(a=>a.length>0);return s?s.length>60?s.slice(0,60)+"…":s:`Untitled ${vd(n.kind)}`}class Xa{isSelectable(){return!0}isDeletable(){return!0}canLock(){return!1}}class Me extends Xa{constructor(r){super(),this.data=r}data;kind="node";get id(){return this.data.id}bounds(){return{x:this.data.x,y:this.data.y,width:this.data.width??Xe,height:this.data.height??en}}label(){return this.displayLabel()}get nodeKind(){return this.data.kind??"standard"}cardLayout(){return"standard"}primaryMedia(){}displayLabel(){return me(this.data)}}class yd extends Me{cardLayout(){return"text-first"}}class gt extends Me{cardLayout(){return"media-first"}primaryMedia(){const r=this.data.media??[];return r.find(t=>t.showOnCard!==!1)??r[0]}}class wd extends gt{}class kd extends gt{}class jd extends gt{}class Nd extends Me{cardLayout(){return"file"}primaryMedia(){const r=this.data.media??[];return r.find(t=>t.mediaType==="file")??r[0]}}function _d(n){switch(n.kind){case"note":return new yd(n);case"image":return new wd(n);case"video":return new kd(n);case"audio":return new jd(n);case"file":return new Nd(n);default:return new Me(n)}}class Ce extends Xa{constructor(r){super(),this.data=r}data;kind="region";get id(){return this.data.id}bounds(){return{x:this.data.x,y:this.data.y,width:this.data.width,height:this.data.height}}label(){return this.data.title||"Region"}canLock(){return!0}contains(r,t){if(r.id===this.id)return!1;if(r instanceof Me)return Hn({x:t?.x??r.data.x,y:t?.y??r.data.y,width:r.data.width,height:r.data.height},this.data);if(r instanceof Ce){const s=t?.x??r.data.x,a=t?.y??r.data.y;return Qa({x:s,y:a,width:r.data.width,height:r.data.height},this.data)}return!1}}function bt(n,r){const t=new Set(n.regions.map(d=>d.id)),s=new Set(n.edges.map(d=>d.id)),a=[],i=[],l=[];for(const d of r)t.has(d)?l.push(d):s.has(d)?i.push(d):a.push(d);return{nodeIds:a,edgeIds:i,regionIds:l}}const r0={getBuildInfo:()=>e0("get_build_info"),getAllNodes:()=>e0("get_all_nodes"),createNode:n=>e0("create_node",{input:n}),updateNode:n=>e0("update_node",{input:n}),restoreNode:n=>e0("restore_node",{node:n}),deleteNode:n=>e0("delete_node",{id:n}),updateNodePositions:n=>e0("update_node_positions",{positions:n}),addNodeLink:n=>e0("add_node_link",{input:n}),deleteNodeLink:n=>e0("delete_node_link",{id:n}),addNodeMedia:n=>e0("add_node_media",{input:n}),updateNodeMedia:(n,r,t,s)=>e0("update_node_media",{id:n,label:r,src:t,srcType:s}),updateNodeMediaShowOnCard:(n,r)=>e0("update_node_media_show_on_card",{id:n,showOnCard:r}),updateNodeMediaSortOrder:(n,r)=>e0("update_node_media_sort_order",{id:n,sortOrder:r}),deleteNodeMedia:n=>e0("delete_node_media",{id:n}),readLocalFile:n=>e0("read_local_file",{path:n}),readTextFileHead:(n,r)=>e0("read_text_file_head",{path:n}),extractOfficeThumbnail:n=>e0("extract_office_thumbnail",{path:n}),setNodePinned:(n,r)=>e0("set_node_pinned",{id:n,pinned:r}),setNodeExpandPinned:(n,r)=>e0("set_node_expand_pinned",{id:n,expandPinned:r}),setNodeZOrder:(n,r)=>e0("set_node_z_order",{id:n,zOrder:r}),setNodeSize:(n,r,t)=>e0("set_node_size",{id:n,width:r,height:t}),setNodeRenderMarkdown:(n,r)=>e0("set_node_render_markdown",{id:n,renderMarkdown:r}),setNodeShowThumbnail:(n,r)=>e0("set_node_show_thumbnail",{id:n,showThumbnail:r}),publishChange:()=>e0("publish_change"),getAllEdges:()=>e0("get_all_edges"),trace:(n,r)=>e0("trace",{seedId:n,direction:r}),createEdge:n=>e0("create_edge",{input:n}),updateEdge:n=>e0("update_edge",{input:n}),updateEdgeWaypoints:n=>e0("update_edge_waypoints",{input:n}),reconnectEdge:(n,r,t,s,a)=>e0("reconnect_edge",{id:n,sourceId:r,targetId:t,sourceHandle:s,targetHandle:a}),restoreEdge:n=>e0("restore_edge",{edge:n}),deleteEdge:n=>e0("delete_edge",{id:n}),getGraphSettings:()=>e0("get_graph_settings"),setActivePreset:n=>e0("set_active_preset",{id:n}),createPreset:n=>e0("create_preset",{input:n}),duplicatePreset:n=>e0("duplicate_preset",{input:n}),renamePreset:n=>e0("rename_preset",{input:n}),deletePreset:n=>e0("delete_preset",{id:n}),createNodeParamDef:n=>e0("create_node_param_def",{input:n}),updateNodeParamDef:n=>e0("update_node_param_def",{input:n}),deleteNodeParamDef:n=>e0("delete_node_param_def",{id:n}),setDrivesColor:n=>e0("set_drives_color",{id:n}),createParamOption:n=>e0("create_param_option",{input:n}),updateParamOption:n=>e0("update_param_option",{input:n}),deleteParamOption:n=>e0("delete_param_option",{id:n}),createEdgeParamDef:n=>e0("create_edge_param_def",{input:n}),updateEdgeParamDef:n=>e0("update_edge_param_def",{input:n}),deleteEdgeParamDef:n=>e0("delete_edge_param_def",{id:n}),setEdgeDrive:(n,r)=>e0("set_edge_drive",{id:n,drive:r}),createEdgeParamOption:n=>e0("create_edge_param_option",{input:n}),updateEdgeParamOption:n=>e0("update_edge_param_option",{input:n}),deleteEdgeParamOption:n=>e0("delete_edge_param_option",{id:n}),getAllRegions:()=>e0("get_all_regions"),createRegion:n=>e0("create_region",{input:n}),updateRegion:n=>e0("update_region",{input:n}),restoreRegion:n=>e0("restore_region",{region:n}),deleteRegion:n=>e0("delete_region",{id:n}),setRegionZOrder:(n,r)=>e0("set_region_z_order",{id:n,zOrder:r}),setRegionLocked:(n,r)=>e0("set_region_locked",{id:n,locked:r}),setRegionMinimized:(n,r)=>e0("set_region_minimized",{id:n,minimized:r}),getAppSetting:n=>e0("get_app_setting",{key:n}),setAppSetting:(n,r)=>e0("set_app_setting",{key:n,value:r}),getDisplayName:()=>e0("get_display_name"),setDisplayName:n=>e0("set_display_name",{name:n}),getLanAddress:()=>e0("get_lan_address"),startHostSession:(n,r)=>e0("start_host_session",{}),stopHostSession:()=>e0("stop_host_session"),startGuestBridge:(n,r)=>e0("start_guest_bridge",{}),stopGuestBridge:()=>e0("stop_guest_bridge"),newGraph:()=>e0("new_graph"),saveGraphToPath:n=>e0("save_graph_to_path",{path:n}),writeTextFile:(n,r)=>e0("write_text_file",{path:n,content:r}),writeBinaryFile:(n,r)=>e0("write_binary_file",{path:n,bytes:r}),getTabs:()=>e0("get_tabs"),createTab:(n,r)=>e0("create_tab",{name:n,presetId:r}),switchTab:n=>e0("switch_tab",{id:n}),closeTab:(n,r=!1)=>e0("close_tab",{id:n}),setTabDirty:(n,r)=>e0("set_tab_dirty",{id:n,dirty:r}),recomputeActiveTabDirty:()=>e0("recompute_active_tab_dirty"),renameTab:(n,r)=>e0("rename_tab",{id:n,name:r}),setTabSavePath:(n,r)=>e0("set_tab_save_path",{id:n,path:r}),getRecentProjects:()=>e0("get_recent_projects"),recordRecentProject:(n,r)=>e0("record_recent_project",{name:n,path:r}),removeRecentProject:n=>e0("remove_recent_project",{path:n}),openPathAsTab:n=>e0("open_path_as_tab",{path:n})};function Id(n,r,t){const s=new Map(n.map(l=>[l.id,l])),a=new Set(r.map(l=>l.id)),i=[];for(const l of r){const d=s.get(l.id);if(d&&t.has(l.id)){i.push(d);continue}if(d&&JSON.stringify(d)===JSON.stringify(l)){i.push(d);continue}i.push(l)}for(const l of n)!a.has(l.id)&&t.has(l.id)&&i.push(l);return i}const Cd=new Set;function nt(n,r,t=Cd){return Id(n,r,t)}const es=new Map;function Jt(n){es.set(n,Date.now())}function ns(n){const r=es.get(n);return r==null?"":`_cb=${r}`}function Sd(n=r0,r=!1){const[t,s]=o.useState([]),[a,i]=o.useState([]),[l,d]=o.useState([]),[u,g]=o.useState(!0),[h,c]=o.useState(null),[b,x]=o.useState(0),m=o.useCallback(M=>{x(O=>O+1),s(M)},[]),k=o.useCallback(M=>{x(O=>O+1),i(M)},[]),w=o.useCallback(M=>{x(O=>O+1),d(M)},[]),E=o.useRef(new Map),j=o.useRef(async()=>{}),v=o.useCallback(M=>{if(!r)return;const O=Date.now()+1500;for(const $ of M)E.current.set($,O)},[r]);o.useEffect(()=>{Promise.all([n.getAllNodes(),n.getAllEdges(),n.getAllRegions()]).then(([M,O,$])=>{s(M),i(O),d($),g(!1)}).catch(M=>{console.error("Failed to load graph data:",M),c(M instanceof Error?M.message:String(M)),g(!1)})},[]);const f=o.useCallback(async M=>{const O=await n.createNode(M);return m($=>[...$,O]),O},[]),I=o.useCallback(async M=>{r&&(m(O=>O.map($=>$.id===M.id?{...$,title:M.title,description:M.description??null,eventDate:M.eventDate??null,x:M.x,y:M.y,color:M.color??null,confidence:M.confidence??null,impactMagnitude:M.impactMagnitude??null,tags:M.tags??$.tags,paramValues:M.paramValues.map((V,d0)=>({id:`opt-${M.id}-${d0}`,nodeId:M.id,paramDefId:V.paramDefId,value:V.value??null,isEnabled:V.isEnabled,showOnCard:V.showOnCard}))}:$)),v([M.id]));try{const O=await n.updateNode(M);return m($=>$.map(V=>V.id===O.id?O:V)),O}catch(O){throw r&&await j.current(),O}},[r,v]),p=o.useCallback(async M=>{const O=await n.restoreNode(M);m($=>$.some(V=>V.id===O.id)?$.map(V=>V.id===O.id?O:V):[...$,O])},[]),A=o.useCallback(async M=>{const O=()=>{m($=>$.filter(V=>V.id!==M)),k($=>$.filter(V=>V.sourceId!==M&&V.targetId!==M))};r&&(O(),v([M]));try{await n.deleteNode(M),r||O()}catch($){throw r&&await j.current(),$}},[r,v]),F=o.useCallback(async M=>{const O=()=>m($=>$.map(V=>{const d0=M.find(m0=>m0.id===V.id);return d0?{...V,x:d0.x,y:d0.y}:V}));r&&(O(),v(M.map($=>$.id)));try{await n.updateNodePositions(M),r||O()}catch($){throw r&&await j.current(),$}},[r,v]),Z=o.useCallback(async M=>{const O=await n.addNodeLink(M);return m($=>$.map(V=>V.id===M.nodeId?{...V,links:[...V.links,O]}:V)),O},[]),H=o.useCallback(async(M,O)=>{await n.deleteNodeLink(M),m($=>$.map(V=>V.id===O?{...V,links:V.links.filter(d0=>d0.id!==M)}:V))},[]),J=o.useCallback(async M=>{const O=await n.addNodeMedia(M);return Jt(O.id),m($=>$.map(V=>V.id===M.nodeId?{...V,media:[...V.media,O]}:V)),O},[]),C=o.useCallback(async(M,O,$,V,d0)=>{const m0=await n.updateNodeMedia(M,$,V,d0);return Jt(M),m(R0=>R0.map(J0=>J0.id===O?{...J0,media:J0.media.map(g0=>g0.id===M?m0:g0)}:J0)),m0},[]),z=o.useCallback(async(M,O,$)=>{await n.updateNodeMediaShowOnCard(M,$),m(V=>V.map(d0=>d0.id===O?{...d0,media:d0.media.map(m0=>m0.id===M?{...m0,showOnCard:$}:m0)}:d0))},[]),L=o.useCallback(async(M,O,$)=>{const V=t.find(N0=>N0.id===M);if(!V)return;const d0=[...V.media].sort((N0,O0)=>N0.sortOrder-O0.sortOrder),m0=d0.findIndex(N0=>N0.id===O);if(m0<0)return;const R0=$==="up"?m0-1:m0+1;if(R0<0||R0>=d0.length)return;[d0[m0],d0[R0]]=[d0[R0],d0[m0]];const J0=d0.map((N0,O0)=>({...N0,sortOrder:O0})),g0=J0.filter(N0=>V.media.find(O0=>O0.id===N0.id)?.sortOrder!==N0.sortOrder);m(N0=>N0.map(O0=>O0.id===M?{...O0,media:J0}:O0)),await Promise.all(g0.map(N0=>n.updateNodeMediaSortOrder(N0.id,N0.sortOrder)))},[t]),P=o.useCallback(async(M,O)=>{await n.deleteNodeMedia(M),m($=>$.map(V=>V.id===O?{...V,media:V.media.filter(d0=>d0.id!==M)}:V))},[]),W=o.useCallback(async M=>{const O=await n.createEdge(M);return k($=>[...$,O]),O},[]),_=o.useCallback(async M=>{const O=await n.updateEdge(M);return k($=>$.map(V=>V.id===O.id?O:V)),O},[]),a0=o.useCallback(async(M,O)=>{const $={id:M,waypoints:O},V=await n.updateEdgeWaypoints($);return k(d0=>d0.map(m0=>m0.id===V.id?V:m0)),V},[]),c0=o.useCallback(async M=>{const O=await n.restoreEdge(M);k($=>$.some(V=>V.id===O.id)?$.map(V=>V.id===O.id?O:V):[...$,O])},[]),B=o.useCallback(async(M,O,$,V,d0)=>{r&&(k(m0=>m0.map(R0=>R0.id===M?{...R0,sourceId:O,targetId:$,sourceHandle:V??null,targetHandle:d0??null}:R0)),v([M]));try{const m0=await n.reconnectEdge(M,O,$,V,d0);k(R0=>R0.map(J0=>J0.id===m0.id?m0:J0))}catch(m0){throw r&&await j.current(),m0}},[r,v]),S=o.useCallback(async M=>{const O=()=>k($=>$.filter(V=>V.id!==M));r&&(O(),v([M]));try{await n.deleteEdge(M),r||O()}catch($){throw r&&await j.current(),$}},[r,v]),E0=o.useCallback(async M=>{const O=await n.createRegion(M);return w($=>[...$,O]),O},[]),Y0=o.useCallback(async M=>{r&&(w(O=>O.map($=>$.id===M.id?{...$,title:M.title,x:M.x,y:M.y,width:M.width,height:M.height,color:M.color??null}:$)),v([M.id]));try{const O=await n.updateRegion(M);return w($=>$.map(V=>V.id===O.id?O:V)),O}catch(O){throw r&&await j.current(),O}},[r,v]),A0=o.useCallback(async M=>{const O=await n.restoreRegion(M);w($=>$.some(V=>V.id===O.id)?$.map(V=>V.id===O.id?O:V):[...$,O])},[]),I0=o.useCallback(async M=>{const O=()=>w($=>$.filter(V=>V.id!==M));r&&(O(),v([M]));try{await n.deleteRegion(M),r||O()}catch($){throw r&&await j.current(),$}},[r,v]),q0=o.useCallback(async(M,O)=>{r&&(w($=>$.map(V=>V.id===M?{...V,zOrder:O}:V)),v([M]));try{const $=await n.setRegionZOrder(M,O);return w(V=>V.map(d0=>d0.id===$.id?$:d0)),$}catch($){throw r&&await j.current(),$}},[r,v]),W0=o.useCallback(async(M,O)=>{r&&(m($=>$.map(V=>V.id===M?{...V,zOrder:O}:V)),v([M]));try{const $=await n.setNodeZOrder(M,O);return m(V=>V.map(d0=>d0.id===$.id?$:d0)),$}catch($){throw r&&await j.current(),$}},[r,v]),H0=o.useCallback(async(M,O,$)=>{r&&(m(V=>V.map(d0=>d0.id===M?{...d0,width:O,height:$}:d0)),v([M]));try{const V=await n.setNodeSize(M,O,$);return m(d0=>d0.map(m0=>m0.id===V.id?V:m0)),V}catch(V){throw r&&await j.current(),V}},[r,v]),U0=o.useCallback(async(M,O)=>{m($=>$.map(V=>V.id===M?{...V,renderMarkdown:O}:V)),r&&v([M]);try{await n.setNodeRenderMarkdown(M,O)}catch($){throw r&&await j.current(),$}},[n,r,v]),F0=o.useCallback(async(M,O)=>{m($=>$.map(V=>V.id===M?{...V,showThumbnail:O}:V)),r&&v([M]);try{await n.setNodeShowThumbnail(M,O)}catch($){throw r&&await j.current(),$}},[n,r,v]),M0=o.useCallback(async()=>{const[M,O,$]=await Promise.all([n.getAllNodes(),n.getAllEdges(),n.getAllRegions()]);let V;if(r){const d0=Date.now();V=new Set;for(const[m0,R0]of E.current)R0>d0?V.add(m0):E.current.delete(m0)}s(d0=>nt(d0,M,V)),i(d0=>nt(d0,O,V)),d(d0=>nt(d0,$,V))},[n,r]);return j.current=M0,{nodes:t,edges:a,regions:l,loading:u,loadError:h,mutationSeq:b,addNode:f,updateNode:I,deleteNode:A,updatePositions:F,addLink:Z,removeLink:H,addMedia:J,updateMedia:C,updateMediaShowOnCard:z,reorderMedia:L,removeMedia:P,addEdge:W,updateEdge:_,updateEdgeWaypoints:a0,reconnectEdge:B,restoreEdge:c0,restoreNode:p,deleteEdge:S,addRegion:E0,updateRegion:Y0,restoreRegion:A0,deleteRegion:I0,setRegionZOrder:q0,setNodeZOrder:W0,setNodeSize:H0,setNodeRenderMarkdown:U0,setNodeShowThumbnail:F0,reload:M0}}function Ed(){const n=o.useRef([]),r=o.useRef([]),t=o.useRef(!1),[s,a]=o.useState(!1),[i,l]=o.useState(!1),[d,u]=o.useState(0);function g(){a(n.current.length>0),l(r.current.length>0),u(n.current.length)}function h(m){n.current.push(m),r.current=[],g()}async function c(){if(t.current)return;const m=n.current[n.current.length-1];if(m){t.current=!0;try{await m.undo();const k=n.current.lastIndexOf(m);k!==-1&&n.current.splice(k,1),r.current.push(m),g()}catch(k){console.error("Undo failed; entry kept on the stack",k)}finally{t.current=!1}}}async function b(){if(t.current)return;const m=r.current[r.current.length-1];if(m){t.current=!0;try{await m.redo();const k=r.current.lastIndexOf(m);k!==-1&&r.current.splice(k,1),n.current.push(m),g()}catch(k){console.error("Redo failed; entry kept on the stack",k)}finally{t.current=!1}}}function x(){n.current=[],r.current=[],t.current=!1,g()}return{push:h,undo:c,redo:b,canUndo:s,canRedo:i,clear:x,undoCount:d}}async function Sr(n){let r=n;!/^https?:\/\//i.test(r)&&!r.startsWith("mailto:")&&(r="https://"+r),window.open(r,"_blank","noopener,noreferrer")}async function rs(n){}const ts=o.createContext(null),yr="#545454",Yt="#ffffff";function Qt({children:n,seed:r}){const[t,s]=o.useState(r??null),[a,i]=o.useState("waypoints"),[l,d]=o.useState(!1),[u,g]=o.useState(!0),[h,c]=o.useState(!1),b=o.useCallback(async()=>{if(r!==void 0){s(r);return}try{const[C,z,L,P,W]=await Promise.all([r0.getGraphSettings(),r0.getAppSetting("edge_routing_mode"),r0.getAppSetting("snap_to_grid"),r0.getAppSetting("api_enabled"),r0.getAppSetting("expand_nodes_default")]);s(C),(z==="bezier"||z==="waypoints"||z==="orthogonal")&&i(z),d(L==="true"),g(W!=="false"),c(P==="true")}catch(C){console.error("Failed to load graph settings",C)}},[r]),x=o.useCallback(async C=>{i(C),await r0.setAppSetting("edge_routing_mode",C)},[]),m=o.useCallback(async C=>{d(C),await r0.setAppSetting("snap_to_grid",String(C))},[]),k=o.useCallback(async C=>{g(C),await r0.setAppSetting("expand_nodes_default",String(C))},[]),w=o.useCallback(async C=>{c(C),await r0.setAppSetting("api_enabled",String(C))},[]);o.useEffect(()=>{b()},[b]);const E=t?.paramDefs??[],j=t?.edgeParamDefs??[],v=E.find(C=>C.drivesColor)??null,f=o.useCallback((C,z)=>z?E.find(P=>P.id===C)?.options.find(P=>P.valueSlug===z)??null:null,[E]),I=o.useCallback(C=>{if(C.color)return C.color;if(!v)return yr;const z=C.paramValues.find(L=>L.paramDefId===v.id);return z?.value?v.options.find(L=>L.valueSlug===z.value)?.color??yr:yr},[v]),p=o.useCallback(C=>{if(!v)return null;const z=C.paramValues.find(P=>P.paramDefId===v.id);if(!z?.value)return null;const L=v.options.find(P=>P.valueSlug===z.value);return L?{label:L.label,color:L.color??yr}:null},[v]),A=o.useCallback(C=>C&&C.color||Yt,[]),F=o.useCallback(C=>{if(!C)return"default";const z=j.find(P=>P.drivesStyle);return z?C.paramValues.find(P=>P.paramDefId===z.id&&P.isEnabled)?.value??"default":"default"},[j]),Z=o.useCallback(C=>{if(!C)return 5;const z=j.find(P=>P.drivesWidth);if(!z)return 5;const L=C.paramValues.find(P=>P.paramDefId===z.id&&P.isEnabled);return L?.value?Number(L.value):5},[j]),H=o.useCallback(C=>{if(!C)return!0;const z=j.find(P=>P.drivesArrow);if(!z)return!0;const L=C.paramValues.find(P=>P.paramDefId===z.id&&P.isEnabled);return L?L.value==="true":!0},[j]),J=o.useCallback(C=>{if(!C)return null;const z=j.find(P=>P.drivesColor);if(!z)return null;const L=C.paramValues.find(P=>P.paramDefId===z.id&&P.isEnabled);return L?.value?z.options.find(P=>P.valueSlug===L.value)?.label??null:null},[j]);return e.jsx(ts.Provider,{value:{settings:t,refreshSettings:b,activeParamDefs:E,activeEdgeParamDefs:j,colorDriverParam:v,edgeRoutingMode:a,setEdgeRoutingMode:x,snapToGrid:l,setSnapToGrid:m,expandNodesByDefault:u,setExpandNodesByDefault:k,apiEnabled:h,setApiEnabled:w,getNodeColor:I,getNodeBadge:p,getParamOption:f,getEdgeColor:A,getEdgeStyle:F,getEdgeWidth:Z,getEdgeArrow:H,getEdgeLabel:J},children:n})}function Se(){const n=o.useContext(ts);if(!n)throw new Error("useSettings must be used inside SettingsProvider");return n}const as=0,ss=1,Rr=2;function Dd(n){return n>=.2?Rr:n>=.1?ss:as}const os=o.createContext({capturedIds:new Set,capturedEdgeIds:new Set,regionDragOffset:null,highlightedNodeIds:new Set,traceNodeIds:new Set,traceEdgeIds:new Set,traceSeedId:null,edgeCountByNodeId:new Map,hoveredEndpointIds:new Set,pinnedNodeIds:new Set,connectingFromNodeId:null,pinnedExpandIds:new Set,expandOverrides:new Map,togglePinnedExpand:()=>{},togglePin:()=>{},flashingNodeId:null,updateNoteText:()=>{},toggleRenderMarkdown:()=>{},toggleShowThumbnail:()=>{},resizeNode:()=>{},lodTier:Rr,readOnly:!1});function xt(){return o.useContext(os)}let ut=null,is="";function Xt(n,r=""){ut=n,is=r}function Td(n){return ut?`${ut.replace(/\/+$/,"")}/api/media/${encodeURIComponent(n)}/file?token=${encodeURIComponent(is)}`:null}const Md=/^(https?:|mailto:)/i,Od=["h1","h2","h3","h4","h5","h6"];function Pd(n){return/^```/.test(n)||/^\s*([-*_])\1\1+\s*$/.test(n)||/^#{1,6}\s/.test(n)||/^\s*>/.test(n)||/^\s*[-*+]\s+/.test(n)||/^\s*\d+\.\s+/.test(n)}function vn(n,r,t){const s=[];let a="",i=0,l=0;const d=()=>{a&&(s.push(a),a="")};for(;i<n.length;){const u=n.slice(i);let g;if(g=/^`([^`]+)`/.exec(u)){d(),s.push(e.jsx("code",{className:"md-code",children:g[1]},`${r}-c${l++}`)),i+=g[0].length;continue}if((g=/^\*\*([^*]+?)\*\*/.exec(u))||(g=/^__([^_]+?)__/.exec(u))){d(),s.push(e.jsx("strong",{children:vn(g[1],`${r}-b${l}`,t)},`${r}-b${l++}`)),i+=g[0].length;continue}if(g=/^~~([^~]+?)~~/.exec(u)){d(),s.push(e.jsx("del",{children:vn(g[1],`${r}-s${l}`,t)},`${r}-s${l++}`)),i+=g[0].length;continue}if((g=/^\*([^*\n]+?)\*/.exec(u))||(g=/^_([^_\n]+?)_/.exec(u))){d(),s.push(e.jsx("em",{children:vn(g[1],`${r}-i${l}`,t)},`${r}-i${l++}`)),i+=g[0].length;continue}if(g=/^\[([^\]]+)\]\(([^)\s]+)\)/.exec(u)){const[h,c,b]=g;if(Md.test(b)){d();const x=b;s.push(e.jsx("a",{href:x,className:"md-link",onClick:m=>{m.preventDefault(),m.stopPropagation(),t?.onLink?.(x)},children:c},`${r}-l${l++}`))}else a+=h;i+=h.length;continue}a+=n[i],i+=1}return d(),s}function vt(n,r){const t=n.replace(/\r\n?/g,`
`).split(`
`),s=[];let a=0,i=0;for(;a<t.length;){const l=t[a];if(!l.trim()){a+=1;continue}if(/^```/.test(l)){const h=[];for(a+=1;a<t.length&&!/^```/.test(t[a]);)h.push(t[a]),a+=1;a+=1,s.push(e.jsx("pre",{className:"md-pre",children:e.jsx("code",{children:h.join(`
`)})},i++));continue}if(/^\s*([-*_])\1\1+\s*$/.test(l)){s.push(e.jsx("hr",{className:"md-hr"},i++)),a+=1;continue}const d=/^(#{1,6})\s+(.*)$/.exec(l);if(d){const h=d[1].length,c=Od[h-1];s.push(e.jsx(c,{className:`md-h md-h${h}`,children:vn(d[2],`h${i}`,r)},i++)),a+=1;continue}if(/^\s*>/.test(l)){const h=[];for(;a<t.length&&/^\s*>/.test(t[a]);)h.push(t[a].replace(/^\s*>\s?/,"")),a+=1;s.push(e.jsx("blockquote",{className:"md-quote",children:vt(h.join(`
`),r)},i++));continue}if(/^\s*[-*+]\s+/.test(l)){const h=[];for(;a<t.length&&/^\s*[-*+]\s+/.test(t[a]);)h.push(t[a].replace(/^\s*[-*+]\s+/,"")),a+=1;s.push(e.jsx("ul",{className:"md-ul",children:h.map((c,b)=>e.jsx("li",{children:vn(c,`ul${i}-${b}`,r)},b))},i++));continue}if(/^\s*\d+\.\s+/.test(l)){const h=[];for(;a<t.length&&/^\s*\d+\.\s+/.test(t[a]);)h.push(t[a].replace(/^\s*\d+\.\s+/,"")),a+=1;s.push(e.jsx("ol",{className:"md-ol",children:h.map((c,b)=>e.jsx("li",{children:vn(c,`ol${i}-${b}`,r)},b))},i++));continue}const u=[];for(;a<t.length&&t[a].trim()&&!Pd(t[a]);)u.push(t[a]),a+=1;const g=[];u.forEach((h,c)=>{c&&g.push(e.jsx("br",{},`br${i}-${c}`)),g.push(...vn(h,`p${i}-${c}`,r))}),s.push(e.jsx("p",{className:"md-p",children:g},i++))}return e.jsx("div",{className:"md",children:s})}const Rd="modulepreload",zd=function(n){return"/demo/"+n},ea={},Er=function(r,t,s){let a=Promise.resolve();if(t&&t.length>0){let u=function(g){return Promise.all(g.map(h=>Promise.resolve(h).then(c=>({status:"fulfilled",value:c}),c=>({status:"rejected",reason:c}))))};document.getElementsByTagName("link");const l=document.querySelector("meta[property=csp-nonce]"),d=l?.nonce||l?.getAttribute("nonce");a=u(t.map(g=>{if(g=zd(g),g in ea)return;ea[g]=!0;const h=g.endsWith(".css"),c=h?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${g}"]${c}`))return;const b=document.createElement("link");if(b.rel=h?"stylesheet":Rd,h||(b.as="script"),b.crossOrigin="",b.href=g,d&&b.setAttribute("nonce",d),document.head.appendChild(b),h)return new Promise((x,m)=>{b.addEventListener("load",x),b.addEventListener("error",()=>m(new Error(`Unable to preload CSS for ${g}`)))})}))}function i(l){const d=new Event("vite:preloadError",{cancelable:!0});if(d.payload=l,window.dispatchEvent(d),!d.defaultPrevented)throw l}return a.then(l=>{for(const d of l||[])d.status==="rejected"&&i(d.reason);return r().catch(i)})},Ad=new Set(["jpg","jpeg","jfif","png","gif","webp","bmp","svg","avif","ico","heic","heif"]),$d=new Set(["mp4","m4v","webm","mov","mkv","avi","ogv","3gp","3g2","m2ts","mts","wmv","flv","mpg","mpeg"]),Ld=new Set(["mp3","wav","m4a","aac","flac","opus","weba","oga","ogg","wma","aiff","aif","mid","midi"]);function Vd(n){const r=n.replace(/^\./,"").toLowerCase();return Ad.has(r)?"image":$d.has(r)?"video":Ld.has(r)?"audio":null}function Fn(n){const r=n.split(/[?#]/)[0],t=r.split(/[\\/]/).pop()??r,s=t.lastIndexOf(".");return s>0?t.slice(s+1):""}function Dr(n){const r=n.split(/[?#]/)[0],t=r.split(/[\\/]/).pop()??r;try{return decodeURIComponent(t)}catch{return t}}function Hd(n){return Vd(Fn(n))}function Fd(n){if(!n)return null;const r=n.getData("text/uri-list");if(r){const s=r.split(`
`).map(a=>a.trim()).find(a=>a&&!a.startsWith("#"));if(s)return s}const t=n.getData("text/plain").trim();return/^https?:\/\/\S+$/i.test(t)?t:null}const Bd=new Set(["png","jpg","jpeg","jfif","gif","webp","bmp","svg","avif","ico"]),Wd=new Set(["txt","text","md","markdown","mdx","rst","log","csv","tsv","json","jsonc","xml","yaml","yml","toml","ini","cfg","conf","env","js","jsx","mjs","cjs","ts","tsx","py","rb","rs","go","java","kt","c","h","hpp","cpp","cc","cs","php","swift","sh","bash","zsh","ps1","sql","html","htm","css","scss","sass","less","vue","svelte","tex","r"]),ds=new Set(["docx","docm","pptx","pptm","xlsx","xlsm"]),Ud=new Set(["doc","ppt","xls"]);function ls(n){const r=Fn(n).toLowerCase();return Bd.has(r)?"image":r==="pdf"?"pdf":Wd.has(r)?"text":ds.has(r)||Ud.has(r)?"office":"other"}function Gd(n){return ds.has(Fn(n).toLowerCase())}function qd(n){const r=Fn(n).toLowerCase();return r==="md"||r==="markdown"||r==="mdx"}function Kd(n){return(Fn(n)||"file").toUpperCase().slice(0,5)}function pt(n,r){const t=Fn(n).toLowerCase(),s=ls(n);let a=Xn;return s==="image"?a=bi:t==="pdf"||["docx","docm","doc"].includes(t)?a=_r:["xlsx","xlsm","xls","csv","tsv"].includes(t)?a=vi:["pptx","pptm","ppt"].includes(t)?a=Ji:["zip","rar","7z","tar","gz","bz2","xz"].includes(t)?a=hi:s==="text"&&(a=_r),e.jsx(a,{size:r})}function Zd({item:n,resolvedSrc:r,showThumbnail:t=!0}){const s=n.label||Dr(n.src),a=ls(s),i=n.srcType==="file",[l,d]=o.useState(null),[u,g]=o.useState(null),[h,c]=o.useState(null),[b,x]=o.useState(!1);o.useEffect(()=>{if(!t||a!=="text"||!i)return;let w=!1;return r0.readTextFileHead(n.src,4e3).then(E=>{w||d(E)}).catch(()=>{}),()=>{w=!0}},[t,a,i,n.src]),o.useEffect(()=>{if(!t||a!=="office"||!i||!Gd(s))return;let w=!1,E=null;return r0.extractOfficeThumbnail(n.src).then(j=>{w||!j||!j.length||(E=URL.createObjectURL(new Blob([new Uint8Array(j)])),g(E))}).catch(()=>{}),()=>{w=!0,E&&URL.revokeObjectURL(E)}},[t,a,i,s,n.src]),o.useEffect(()=>{if(!t||a!=="pdf"||!i&&!r)return;let w=!1;return(async()=>{try{const E=await Er(()=>import("./pdf-CkIk37Ba.js"),[]),j=(await Er(async()=>{const{default:C}=await import("./pdf.worker.min-Co2nzU8f.js");return{default:C}},[])).default;E.GlobalWorkerOptions.workerSrc=j;const v=i?{data:new Uint8Array(await r0.readLocalFile(n.src))}:{url:r},f=E.getDocument(v),p=await(await f.promise).getPage(1),A=p.getViewport({scale:1}),F=Math.min(2,600/A.width),Z=p.getViewport({scale:F}),H=document.createElement("canvas");H.width=Math.ceil(Z.width),H.height=Math.ceil(Z.height);const J=H.getContext("2d");J&&(await p.render({canvas:H,canvasContext:J,viewport:Z}).promise,w||c(H.toDataURL("image/png"))),await f.destroy()}catch{}})(),()=>{w=!0}},[t,a,i,n.src,r]);function m(w){w.stopPropagation(),n.srcType==="file"?rs(n.src):Sr(n.src)}let k;return t?a==="image"&&r&&!b?k=e.jsx("img",{className:"file-preview__img",src:r,alt:s,draggable:!1,onError:()=>x(!0)}):a==="pdf"&&h?k=e.jsx("img",{className:"file-preview__img",src:h,alt:s,draggable:!1}):a==="text"&&l!=null&&l.trim()?k=qd(s)?e.jsx("div",{className:"file-preview__text node-card__note-rendered",children:vt(l)}):e.jsx("pre",{className:"file-preview__text",children:l}):a==="office"&&u&&(k=e.jsx("img",{className:"file-preview__img",src:u,alt:s,draggable:!1})):k=null,k==null&&(k=e.jsxs("div",{className:"file-preview__icon",children:[pt(s,30),e.jsx("span",{className:"file-preview__ext",children:Kd(s)})]})),e.jsxs("div",{className:"file-preview",children:[k,e.jsx("button",{className:"node-media-expand nodrag nopan",title:"Open file",onClick:m,onMouseDown:w=>w.stopPropagation(),children:e.jsx(dt,{size:11})})]})}function na(n){if(!isFinite(n))return"0:00";const r=Math.floor(n/60),t=Math.floor(n%60);return`${r}:${t.toString().padStart(2,"0")}`}function yn(n){let r;n.srcType==="file"?r=Td(n.id)??n.src:r=n.src;const t=ns(n.id);return t?r+(r.includes("?")?"&":"?")+t:r}function Jd({item:n,onRegister:r}){const t=o.useRef(null),[s,a]=o.useState(!1),[i,l]=o.useState(0),[d,u]=o.useState(0),[g,h]=o.useState(1),[c,b]=o.useState(!1),x=o.useCallback(j=>{t.current=j,j&&(j.volume=g,j.muted=c),r?.(n.id,j)},[n.id,r,g,c]);o.useEffect(()=>{const j=t.current;j&&(j.volume=g,j.muted=c)},[g,c]);function m(j){j.stopPropagation(),b(v=>!v)}function k(j){j.stopPropagation();const v=Number(j.target.value);h(v),b(v===0)}function w(j){j.stopPropagation();const v=t.current;v&&(v.paused?v.play().catch(()=>{}):v.pause())}function E(j){j.stopPropagation();const v=t.current;if(!v)return;const f=Number(j.target.value);v.currentTime=f,l(f)}return e.jsxs("div",{className:"node-audio-player nodrag nopan",children:[e.jsx("audio",{ref:x,src:yn(n),preload:"metadata",onPlay:()=>a(!0),onPause:()=>a(!1),onTimeUpdate:()=>l(t.current?.currentTime??0),onLoadedMetadata:()=>u(t.current?.duration??0),onEnded:()=>{a(!1),l(0)}}),n.label&&e.jsx("span",{className:"node-audio-player__label",children:n.label}),e.jsxs("div",{className:"node-audio-player__controls",children:[e.jsx("button",{className:"node-audio-player__btn",onClick:w,title:s?"Pause":"Play",children:s?e.jsx(Bi,{size:9}):e.jsx(Ka,{size:9})}),e.jsx("input",{type:"range",className:"node-audio-player__seek",min:0,max:d||100,value:i,step:.05,onChange:E,onClick:j=>j.stopPropagation()}),e.jsxs("span",{className:"node-audio-player__time",children:[na(i),e.jsxs("span",{className:"node-audio-player__dur",children:["/",na(d)]})]}),e.jsxs("div",{className:"node-audio-player__volume nodrag nopan",children:[e.jsx("button",{className:"node-audio-player__btn",onClick:m,title:c||g===0?"Unmute":"Mute",children:c||g===0?e.jsx(hd,{size:9}):e.jsx(md,{size:9})}),e.jsx("input",{type:"range",className:"node-audio-player__vol",min:0,max:1,step:.05,value:c?0:g,onChange:k,onClick:j=>j.stopPropagation(),title:"Volume"})]})]})]})}function Yd(){return e.jsx("div",{className:"node-audio-player node-audio-player--empty nodrag nopan",children:e.jsxs("div",{className:"node-audio-player__controls",children:[e.jsx("button",{className:"node-audio-player__btn",disabled:!0,title:"No audio source yet",children:e.jsx(Ka,{size:9})}),e.jsx("input",{type:"range",className:"node-audio-player__seek",min:0,max:100,value:0,disabled:!0,readOnly:!0}),e.jsxs("span",{className:"node-audio-player__time",children:["0:00",e.jsx("span",{className:"node-audio-player__dur",children:"/0:00"})]})]})})}function Qd({item:n}){const[r,t]=o.useState("loading");return e.jsxs("div",{className:"node-media-wrap",children:[r==="loading"&&e.jsx("div",{className:"node-media-placeholder"}),r==="error"&&e.jsx("div",{className:"node-media-error",children:"⚠ Failed to load"}),e.jsx("img",{src:yn(n),alt:n.label||"",className:"node-media-img",draggable:!1,style:r!=="ok"?{display:"none"}:void 0,onLoad:()=>t("ok"),onError:()=>t("error")})]})}function Xd({item:n,onRegister:r}){const[t,s]=o.useState("loading"),a=o.useCallback(i=>{r?.(n.id,i)},[n.id,r]);return e.jsxs("div",{className:"node-media-wrap",children:[t==="loading"&&e.jsx("div",{className:"node-media-placeholder"}),t==="error"&&e.jsx("div",{className:"node-media-error",children:"⚠ Failed to load"}),e.jsx("video",{ref:a,src:yn(n),className:"node-media-video nodrag nopan",controls:!0,preload:"metadata",draggable:!1,style:t!=="ok"?{display:"none"}:void 0,onCanPlay:()=>s("ok"),onError:()=>s("error")})]})}function cs(n){const r=t=>{const s=getComputedStyle(n).overflowY;if(s!=="auto"&&s!=="scroll")return;const a=n.scrollHeight-n.clientHeight-n.scrollTop>1,i=n.scrollTop>1;(t.deltaY>0&&a||t.deltaY<0&&i)&&t.stopPropagation()};return n.addEventListener("wheel",r),()=>n.removeEventListener("wheel",r)}function el({id:n,value:r,onCommit:t,autoFocus:s,onBlurDone:a}){const[i,l]=o.useState(r),d=o.useRef(!1),u=o.useRef(null),g=o.useRef(null);return o.useEffect(()=>{l(r)},[n]),o.useEffect(()=>{d.current||l(r)},[r]),o.useEffect(()=>()=>{u.current&&clearTimeout(u.current)},[]),o.useEffect(()=>{if(!s)return;const h=g.current;h&&(h.focus(),h.setSelectionRange(h.value.length,h.value.length))},[s]),o.useEffect(()=>{const h=g.current;return h?cs(h):void 0},[]),e.jsx("textarea",{ref:g,className:"node-card__note-edit nodrag",value:i,placeholder:"Write a note…",onFocus:()=>{d.current=!0},onChange:h=>{const c=h.target.value;l(c),u.current&&clearTimeout(u.current),u.current=setTimeout(()=>t(n,c),400)},onBlur:()=>{d.current=!1,u.current&&(clearTimeout(u.current),u.current=null),t(n,i),a?.()},onDoubleClick:h=>h.stopPropagation()})}function nl({id:n,value:r,markdownOn:t,editing:s,setEditing:a,onCommit:i}){const l=o.useRef({t:0,x:0,y:0}),d=o.useRef(null);return o.useEffect(()=>{if(s)return;function u(g){const h=d.current;if(!h)return;const c=l.current;if(Date.now()-c.t<500&&Math.abs(g.clientX-c.x)<6&&Math.abs(g.clientY-c.y)<6){g.preventDefault(),g.stopPropagation(),l.current={t:0,x:0,y:0},a(!0);return}const x=h.getBoundingClientRect();g.clientX>=x.left&&g.clientX<=x.right&&g.clientY>=x.top&&g.clientY<=x.bottom&&(l.current={t:Date.now(),x:g.clientX,y:g.clientY})}return document.addEventListener("click",u,!0),()=>document.removeEventListener("click",u,!0)},[s,a]),o.useEffect(()=>{if(s)return;const u=d.current;return u?cs(u):void 0},[s]),s?e.jsx(el,{id:n,value:r,onCommit:i,autoFocus:!0,onBlurDone:()=>a(!1)}):e.jsx("div",{ref:d,className:`node-card__note-body nodrag${t?" node-card__note-rendered":""}`,title:"Double-click to edit",children:r.trim()?t?vt(r,{onLink:u=>{Sr(u)}}):r:e.jsx("span",{className:"node-card__note-empty",children:"Write a note…"})})}function rl({data:n,selected:r}){const{getNodeColor:t,getNodeBadge:s,activeParamDefs:a,expandNodesByDefault:i}=Se(),{capturedIds:l,highlightedNodeIds:d,traceNodeIds:u,traceSeedId:g,edgeCountByNodeId:h,hoveredEndpointIds:c,pinnedNodeIds:b,connectingFromNodeId:x,pinnedExpandIds:m,expandOverrides:k,togglePinnedExpand:w,togglePin:E,flashingNodeId:j,updateNoteText:v,toggleRenderMarkdown:f,toggleShowThumbnail:I,resizeNode:p,lodTier:A,readOnly:F}=xt(),Z=u.size>0,H=g===n.id,J=Z&&!H&&u.has(n.id),C=Z?!u.has(n.id):d.size>0&&!d.has(n.id),z=j===n.id,L=x===n.id,P=h.get(n.id)??0,W=c.has(n.id),_=b.has(n.id),a0=m.has(n.id),c0=k.get(n.id),B=c0!==void 0?c0:a0||i,[S,E0]=o.useState(null),[Y0,A0]=o.useState(!1),I0=o.useRef(new Map),q0=o.useRef(0),W0=o.useRef(null),H0=o.useCallback((G,h0)=>{h0?I0.current.set(G,h0):I0.current.delete(G)},[]),U0=o.useCallback(G=>{const h0=I0.current.get(G.id);q0.current=h0?h0.currentTime:0,h0?.pause(),E0(G)},[]),F0=o.useCallback(()=>{E0(G=>{if(G){const h0=I0.current.get(G.id),L0=W0.current;h0&&L0&&isFinite(L0.currentTime)&&(h0.currentTime=L0.currentTime)}return W0.current=null,null})},[]);o.useEffect(()=>{if(!S)return;function G(h0){h0.key==="Escape"&&F0()}return window.addEventListener("keydown",G),()=>window.removeEventListener("keydown",G)},[S,F0]);const M0=t(n),M=s(n),O=n.description&&n.description.length>80?n.description.slice(0,80)+"…":n.description,$=a.filter(G=>{const h0=n.paramValues.find(L0=>L0.paramDefId===G.id);return h0?.showOnCard&&h0.value!=null&&h0.value!==""}).sort((G,h0)=>G.sortOrder-h0.sortOrder).map(G=>{const h0=n.paramValues.find(ne=>ne.paramDefId===G.id);let L0=h0.value??"";return G.paramType==="select_color"||G.paramType==="select"?L0=G.options.find(ne=>ne.valueSlug===h0.value)?.label??h0.value??"":G.paramType==="boolean"&&(L0=h0.value==="true"?"Yes":"No"),{def:G,display:L0}}),V=l.has(n.id),m0=(n.media??[]).filter(G=>G.showOnCard!==!1),R0=m0.filter(G=>G.mediaType==="image").length,J0=m0.filter(G=>G.mediaType==="video").length,g0=m0.filter(G=>G.mediaType==="audio").length,N0=V||n.links.length>0||R0>0||J0>0||g0>0||n.confidence!=null||P>0,O0=_d(n),Q0=O0.cardLayout(),X0=Q0==="text-first",ee=Q0==="media-first",B0=Q0==="file",y0=ee||B0?O0.primaryMedia():void 0,D=n.renderMarkdown!==!1,i0=n.showThumbnail!==!1,n0=A>=Rr,C0=A===as?" node-card--lod-min":A===ss?" node-card--lod-compact":"",P0=n.kind==="note"||n.kind==="image"||n.kind==="video"||n.kind==="file",_0=n.kind==="note"?e.jsx(ht,{size:10}):n.kind==="image"?e.jsx(Je,{size:10}):n.kind==="video"?e.jsx(on,{size:10}):n.kind==="audio"?e.jsx(wn,{size:10}):n.kind==="file"?pt(y0?y0.label||y0.src:"file",10):null,D0=G=>{const h0=`${G.id}:${G.src}`;return e.jsxs("div",{className:"node-media-slot",children:[G.mediaType==="image"&&e.jsx(Qd,{item:G}),G.mediaType==="video"&&e.jsx(Xd,{item:G,onRegister:H0}),G.mediaType==="audio"&&e.jsx(Jd,{item:G,onRegister:H0}),e.jsx("button",{className:"node-media-expand nodrag nopan",title:"Expand",onClick:L0=>{L0.stopPropagation(),U0(G)},onMouseDown:L0=>L0.stopPropagation(),children:e.jsx(Wa,{size:11})})]},h0)};return e.jsxs("div",{className:`node-card ${r?"node-card--selected":""} ${C?"node-card--dimmed":""} ${H?"node-card--trace-seed":""} ${J?"node-card--traced":""} ${W?"node-card--endpoint":""} ${L?"node-card--connecting":""} ${B?"node-card--expand-default":""} ${c0===!1?"node-card--force-collapsed":""} ${z?"node-card--flash":""} ${X0?"node-card--note":""} ${ee?"node-card--media":""} ${B0?"node-card--media node-card--file":""} ${P0?"node-card--resizable":""} ${_?"node-card--pinned":""}${C0}`,children:[P0&&!F&&e.jsx(Ma,{isVisible:r,minWidth:120,minHeight:60,onResizeEnd:(G,h0)=>p(n.id,h0.x,h0.y,h0.width,h0.height)}),e.jsx(an,{type:"source",id:"top",position:sn.Top,className:"node-handle",title:"Drag to connect"}),e.jsx(an,{type:"source",id:"bottom",position:sn.Bottom,className:"node-handle",title:"Drag to connect"}),e.jsx(an,{type:"source",id:"left",position:sn.Left,className:"node-handle",title:"Drag to connect"}),e.jsx(an,{type:"source",id:"right",position:sn.Right,className:"node-handle",title:"Drag to connect"}),e.jsx("div",{className:"node-card__stripe",style:{background:M0}}),e.jsxs("div",{className:"node-card__body",children:[e.jsxs("div",{className:"node-card__title-row",children:[_0&&e.jsx("span",{className:"node-card__kind-icon","aria-hidden":!0,children:_0}),e.jsx("p",{className:"node-card__title",title:me(n),children:me(n)}),X0&&!F&&!Y0&&e.jsx("button",{className:"node-card__edit-toggle nodrag nopan",onClick:G=>{G.stopPropagation(),A0(!0)},onMouseDown:G=>G.stopPropagation(),title:"Edit note text",children:e.jsx(_n,{size:9})}),X0&&!F&&e.jsx("button",{className:`node-card__md-toggle nodrag nopan${D?" node-card__md-toggle--active":""}`,onClick:G=>{G.stopPropagation(),f(n.id)},onMouseDown:G=>G.stopPropagation(),title:D?"Markdown styling on — click for raw text":"Markdown styling off — click to style",children:e.jsx(ld,{size:9})}),B0&&!F&&e.jsx("button",{className:`node-card__md-toggle nodrag nopan${i0?" node-card__md-toggle--active":""}`,onClick:G=>{G.stopPropagation(),I(n.id)},onMouseDown:G=>G.stopPropagation(),title:i0?"Preview on — click to show icon only":"Preview off — click to show thumbnail",children:i0?e.jsx(Je,{size:9}):e.jsx(Ei,{size:9})}),e.jsx("button",{className:`node-card__pin-toggle nodrag nopan${_?" node-card__pin-toggle--active":""}`,onClick:G=>{G.stopPropagation(),E(n.id)},onMouseDown:G=>G.stopPropagation(),title:_?"Unpin position (allow dragging)":"Pin position (prevent dragging)",children:_?e.jsx(Ga,{size:9}):e.jsx(qa,{size:9})}),e.jsx("button",{className:`node-card__expand-toggle nodrag nopan${a0?" node-card__expand-toggle--active":""}`,onClick:G=>{G.stopPropagation(),w(n.id)},onMouseDown:G=>G.stopPropagation(),title:a0?"Collapse on mouse-out":"Keep expanded",children:a0?e.jsx(ai,{size:9}):e.jsx(oi,{size:9})})]}),ee&&n0&&(y0?e.jsx("div",{className:`node-card__item-media${n.kind==="image"?"":" nodrag"}`,children:D0(y0)}):n.kind==="audio"?e.jsx("div",{className:"node-card__item-media nodrag",children:e.jsx(Yd,{})}):e.jsx("div",{className:"node-card__item-media node-card__item-placeholder nodrag",title:"No source yet",children:n.kind==="video"?e.jsx(on,{size:28}):e.jsx(Je,{size:28})})),X0&&e.jsx(nl,{id:n.id,value:n.description??"",markdownOn:D,editing:Y0,setEditing:A0,onCommit:v}),B0&&n0&&(y0?e.jsx("div",{className:"node-card__item-media nodrag",children:e.jsx(Zd,{item:y0,resolvedSrc:yn(y0),showThumbnail:i0})}):e.jsx("div",{className:"node-card__item-media node-card__item-placeholder nodrag",title:"No file yet — add one in the panel or drop a file here",children:pt("file",28)})),e.jsxs("div",{className:"node-card__details",children:[(M||n.eventDate)&&e.jsxs("div",{className:"node-card__header",children:[M&&e.jsx("span",{className:"node-card__badge",style:{color:M.color},children:M.label}),n.eventDate&&e.jsx("span",{className:"node-card__date",children:n.eventDate})]}),!X0&&O&&e.jsx("p",{className:"node-card__desc",children:O}),$.length>0&&e.jsx("div",{className:"node-card__params",children:$.map(({def:G,display:h0})=>e.jsxs("div",{className:"node-card__param",children:[e.jsx("span",{className:"node-card__param-label",children:G.displayName}),e.jsx("span",{className:"node-card__param-value",children:h0})]},G.id))}),n.tags&&n.tags.length>0&&e.jsx("div",{className:"node-card__tags",children:n.tags.map(G=>e.jsx("span",{className:"node-tag",children:G},G))}),N0&&e.jsxs("div",{className:"node-card__meta",children:[n.links.length>0&&e.jsxs("span",{className:"node-card__meta-item",children:[e.jsx(Fa,{size:10}),n.links.length]}),R0>0&&e.jsxs("span",{className:"node-card__meta-item",children:[e.jsx(Je,{size:10}),R0]}),J0>0&&e.jsxs("span",{className:"node-card__meta-item",children:[e.jsx(on,{size:10}),J0]}),g0>0&&e.jsxs("span",{className:"node-card__meta-item",children:[e.jsx(wn,{size:10}),g0]}),P>0&&e.jsxs("span",{className:"node-card__meta-item",title:`${P} connection${P!==1?"s":""}`,children:["⇄ ",P]}),n.confidence!=null&&e.jsxs("span",{className:"node-card__meta-item node-card__meta-item--confidence",children:[n.confidence,"%"]}),V&&e.jsx("span",{className:"node-card__meta-item node-card__meta-item--captured",title:"Captured by locked region",children:e.jsx(Pr,{size:9})})]}),!ee&&!B0&&n0&&m0.length>0&&e.jsx("div",{className:"node-card__media nodrag",children:m0.map(D0)}),S&&We.createPortal(e.jsx("div",{className:"media-modal-overlay",onClick:F0,onMouseDown:G=>G.stopPropagation(),children:e.jsxs("div",{className:"media-modal",onClick:G=>G.stopPropagation(),children:[e.jsx("button",{className:"media-modal__close",title:"Close (Esc)",onClick:F0,children:e.jsx(S0,{size:16})}),S.mediaType==="image"&&e.jsx("img",{src:yn(S),alt:S.label||"",className:"media-modal__media"}),S.mediaType==="video"&&e.jsx("video",{ref:G=>{W0.current=G},src:yn(S),className:"media-modal__media",controls:!0,autoPlay:!0,onLoadedMetadata:G=>{G.currentTarget.currentTime=q0.current}}),S.mediaType==="audio"&&e.jsxs("div",{className:"media-modal__audio",children:[S.label&&e.jsx("div",{className:"media-modal__audio-label",children:S.label}),e.jsx("audio",{ref:G=>{W0.current=G},src:yn(S),controls:!0,autoPlay:!0,onLoadedMetadata:G=>{G.currentTarget.currentTime=q0.current}})]})]})}),document.body)]})]})]})}const tl=o.memo(rl);function al({id:n,data:r,selected:t}){const{capturedIds:s,readOnly:a}=xt(),{title:i,color:l,isMinimized:d,isLocked:u,onMinimize:g,onResize:h,onLock:c}=r,b=s.has(n),x=o.useCallback(w=>{w.stopPropagation(),g(n,!d)},[n,d,g]),m=o.useCallback(w=>{w.stopPropagation(),c(n,!u)},[n,u,c]),k=l??"#484848";return e.jsxs("div",{className:`region-card${d?" region-card--minimized":""}${t?" region-card--selected":""}`,style:{"--region-color":k},children:[!a&&e.jsx(Ma,{isVisible:t&&!d,minWidth:120,minHeight:60,onResizeEnd:(w,E)=>{h(n,E.x,E.y,E.width,E.height)}}),e.jsxs("div",{className:"region-card__header",children:[e.jsx("span",{className:"region-card__title",children:i||"Node Region"}),b&&e.jsx("span",{className:"region-captured-badge",title:"Captured by locked region",children:e.jsx(Fa,{size:9})}),e.jsx("button",{className:`region-lock-btn${u?" region-lock-btn--active":""}`,onClick:m,title:u?"Unlock nodes from region":d?"Lock — expands the region first":"Lock nodes to region",children:u?e.jsx(Pr,{size:10}):e.jsx(Ba,{size:10})}),e.jsx("button",{className:"region-minimize-btn",onClick:x,title:d?"Expand":u?"Minimize — unlocks the region first":"Minimize",children:d?e.jsx(oe,{size:11}):e.jsx(Cr,{size:11})})]}),!d&&e.jsx("div",{className:"region-card__body",style:l?{background:l+"18"}:void 0}),e.jsx(an,{type:"source",id:"top",position:sn.Top,className:"node-handle",style:{opacity:0,pointerEvents:"none"}}),e.jsx(an,{type:"source",id:"bottom",position:sn.Bottom,className:"node-handle",style:{opacity:0,pointerEvents:"none"}}),e.jsx(an,{type:"source",id:"left",position:sn.Left,className:"node-handle",style:{opacity:0,pointerEvents:"none"}}),e.jsx(an,{type:"source",id:"right",position:sn.Right,className:"node-handle",style:{opacity:0,pointerEvents:"none"}})]})}const sl=o.memo(al);function rt(n){switch(n){case"left":return 0;case"right":return Math.PI;case"top":return Math.PI/2;case"bottom":return-Math.PI/2;default:return 0}}function ol(n,r,t){const s=t.x-r.x,a=t.y-r.y;if(s===0&&a===0)return Math.hypot(n.x-r.x,n.y-r.y);const i=Math.max(0,Math.min(1,((n.x-r.x)*s+(n.y-r.y)*a)/(s*s+a*a)));return Math.hypot(n.x-(r.x+i*s),n.y-(r.y+i*a))}function il(n){if(n.length<2)return"";if(n.length===2)return`M ${n[0].x} ${n[0].y} L ${n[1].x} ${n[1].y}`;let r=`M ${n[0].x} ${n[0].y}`;for(let t=0;t<n.length-1;t++){const s=n[t-1]??n[t],a=n[t],i=n[t+1],l=n[t+2]??i,d=a.x+(i.x-s.x)/6,u=a.y+(i.y-s.y)/6,g=i.x-(l.x-a.x)/6,h=i.y-(l.y-a.y)/6;r+=` C ${d} ${u} ${g} ${h} ${i.x} ${i.y}`}return r}function dl({id:n,sourceX:r,sourceY:t,targetX:s,targetY:a,sourcePosition:i,targetPosition:l,data:d,selected:u}){const{getEdgeColor:g,getEdgeStyle:h,getEdgeWidth:c,getEdgeArrow:b,getEdgeLabel:x,edgeRoutingMode:m}=Se(),{capturedEdgeIds:k,regionDragOffset:w,traceNodeIds:E,traceEdgeIds:j}=xt(),{screenToFlowPosition:v}=Oe(),f=d,I=f,p=n.replace(/__remap$/,""),A=k.has(p),F=E.size>0,Z=F&&j.has(p),H=F&&!Z,J=b(I),C=g(I),z=f?.remoteSelColor,L=!!z&&!u,P=u?"#ffb000":z??C,W=c(I),_=(W<=3?.8:W<=7?1.5:2.5)*(L?1.8:1),a0=h(I),c0=a0==="step"?"8 4":a0==="smoothstep"?"3 3":a0==="straight"?"6 3":void 0,B=x(I),S=f?.onWaypointsChange,E0=f?.onHoverChange,Y0=f?.onEdgeLabelChange,A0=I?.label,[I0,q0]=o.useState(!1),[W0,H0]=o.useState(!1),[U0,F0]=o.useState(""),M0=o.useRef(null),[M,O]=o.useState(f?.waypoints??[]),$=o.useRef(M);$.current=M;const V=o.useRef(!1),d0=o.useRef(-1),m0=f?.waypoints,R0=m0?m0.map(X=>`${X.x},${X.y}`).join(";"):"";o.useEffect(()=>{V.current||O(m0??[])},[R0]);const g0=w!=null&&w.memberIds.has(I?.sourceId??"")&&w.memberIds.has(I?.targetId??"")?M.map(X=>({x:X.x+w.dx,y:X.y+w.dy})):M,N0=(r+s)/2,O0=(t+a)/2,[Q0,X0,ee]=Gs({sourceX:r,sourceY:t,sourcePosition:i,targetX:s,targetY:a,targetPosition:l}),B0=g0.length>0,y0=g0[0]?.x??X0,D=g0[0]?.y??ee,i0=B0?`M ${r} ${t} Q ${y0} ${D} ${s} ${a}`:Q0,n0=B0?.25*r+.5*y0+.25*s:X0,C0=B0?.25*t+.5*D+.25*a:ee,P0=g0.length>0,_0=[{x:r,y:t},...g0,{x:s,y:a}],D0=P0?il(_0):Q0,G=Math.max(0,Math.floor((_0.length-1)/2)),h0=P0?(_0[G].x+_0[G+1].x)/2:X0,L0=P0?(_0[G].y+_0[G+1].y)/2:ee,ne=i==="right"||i==="left",Ee=g0[0]?.x??N0,De=g0[0]?.y??O0,[Ue]=qs({sourceX:r,sourceY:t,sourcePosition:i,targetX:s,targetY:a,targetPosition:l,borderRadius:0});let K0;if(g0.length===0)K0=Ue;else if(g0.length===1)K0=ne?`M ${r} ${t} L ${Ee} ${t} L ${Ee} ${a} L ${s} ${a}`:`M ${r} ${t} L ${r} ${De} L ${s} ${De} L ${s} ${a}`;else{const X=[{x:r,y:t},...g0,{x:s,y:a}];let p0=`M ${X[0].x} ${X[0].y}`;for(let G0=1;G0<X.length;G0++){const ie=X[G0-1],te=X[G0];G0===1&&!ne?p0+=` L ${ie.x} ${te.y} L ${te.x} ${te.y}`:p0+=` L ${te.x} ${ie.y} L ${te.x} ${te.y}`}K0=p0}const z0=ne?Ee:N0,He=ne?O0:De;let re,ue,ge;if(m==="orthogonal")if(re=K0,g0.length>=2){const X=[{x:r,y:t},...g0,{x:s,y:a}],p0=Math.floor((X.length-1)/2);ue=(X[p0].x+X[p0+1].x)/2,ge=(X[p0].y+X[p0+1].y)/2}else ue=z0,ge=He;else m==="bezier"?(re=i0,ue=n0,ge=C0):(re=D0,ue=h0,ge=L0);let be=0;if(J){let X;if(m==="bezier")X=B0?Math.atan2(a-D,s-y0):rt(l);else if(m==="waypoints")if(P0){const p0=g0[g0.length-1];X=Math.atan2(a-p0.y,s-p0.x)}else X=rt(l);else if(M.length===0)X=rt(l);else if(M.length===1)X=ne?s>=Ee?0:Math.PI:a>=De?Math.PI/2:-Math.PI/2;else{const p0=M[M.length-1];Math.abs(a-p0.y)>.5?X=a>p0.y?Math.PI/2:-Math.PI/2:X=s>=p0.x?0:Math.PI}be=X*180/Math.PI}const $0=o.useCallback((X,p0)=>{X.stopPropagation(),X.nativeEvent.stopImmediatePropagation(),X.currentTarget.setPointerCapture(X.pointerId),V.current=!0,d0.current=p0},[]),ye=o.useCallback(X=>{if(!V.current||d0.current<0)return;const p0=v({x:X.clientX,y:X.clientY}),G0=d0.current;O(ie=>{const te=[...ie];return te[G0]=p0,te})},[v]),y=o.useCallback(X=>{if(!V.current)return;const p0=v({x:X.clientX,y:X.clientY});O([p0])},[v]),Y=o.useCallback(X=>{if(!V.current)return;const p0=v({x:X.clientX,y:X.clientY});O(ne?[{x:p0.x,y:O0}]:[{x:N0,y:p0.y}])},[v,ne,N0,O0]),t0=o.useCallback(X=>{X.stopPropagation(),X.nativeEvent.stopImmediatePropagation(),V.current=!1,d0.current=-1;const p0=$.current;S?.(n,p0.length>0?p0:null)},[n,S]),K=o.useCallback((X,p0)=>{X.stopPropagation(),O(G0=>{const ie=G0.filter((te,qe)=>qe!==p0);return S?.(n,ie.length>0?ie:null),ie})},[n,S]),k0=o.useCallback(X=>{if(!u)return;X.stopPropagation();const p0=v({x:X.clientX,y:X.clientY});if($.current.some(de=>Math.hypot(p0.x-de.x,p0.y-de.y)<12))return;const ie=[{x:r,y:t},...$.current,{x:s,y:a}];let te=0,qe=1/0;for(let de=0;de<ie.length-1;de++){const ke=ol(p0,ie[de],ie[de+1]);ke<qe&&(qe=ke,te=de)}O(de=>{const ke=[...de];return ke.splice(te,0,p0),S?.(n,ke),ke})},[n,S,v,u,r,t,s,a]),we=u&&(m==="orthogonal"&&M.length<=1||m==="bezier"&&!B0)?ge+20:ge;o.useEffect(()=>{W0&&M0.current?.focus()},[W0]);const dn=o.useCallback(X=>{X.stopPropagation(),F0(A0??""),H0(!0)},[A0]),ln=o.useCallback(()=>{H0(!1);const X=U0.trim();Y0?.(n,X||null)},[n,U0,Y0]),cn=o.useCallback(()=>{H0(!1)},[]),Ge={position:"absolute",width:24,height:24,touchAction:"none",userSelect:"none",pointerEvents:"all"};return e.jsxs(e.Fragment,{children:[e.jsx("path",{className:"react-flow__edge-interaction",d:re,fill:"none",stroke:"transparent",strokeWidth:20,onMouseEnter:()=>{q0(!0),E0?.(n,!0)},onMouseLeave:()=>{q0(!1),E0?.(n,!1)}}),e.jsxs("g",{style:{...I0&&!u?{filter:"brightness(1.7)"}:void 0,...H?{opacity:.1}:void 0,...Z?{filter:"brightness(1.5) drop-shadow(0 0 3px rgba(255,176,0,0.7))"}:void 0},children:[e.jsx("path",{id:n,className:"react-flow__edge-path",d:re,fill:"none",style:{stroke:P,strokeWidth:_,strokeDasharray:c0}}),J&&e.jsx("polygon",{points:"0,0 -8,-4 -8,4",style:{fill:P},transform:`translate(${s},${a}) rotate(${be})`})]}),m==="waypoints"&&u&&e.jsxs(e.Fragment,{children:[!A&&e.jsx("path",{d:P0?D0:Q0,fill:"none",stroke:"transparent",strokeWidth:16,style:{pointerEvents:"stroke",cursor:"crosshair"},onPointerDown:X=>{X.stopPropagation(),X.nativeEvent.stopImmediatePropagation()},onClick:k0}),g0.map((X,p0)=>e.jsx("circle",{cx:X.x,cy:X.y,r:5,className:"edge-handle",style:{pointerEvents:"none"}},p0))]}),m==="bezier"&&u&&e.jsxs(e.Fragment,{children:[B0&&e.jsxs(e.Fragment,{children:[e.jsx("line",{x1:r,y1:t,x2:y0,y2:D,stroke:P,strokeWidth:.6,strokeDasharray:"4 3",opacity:.4}),e.jsx("line",{x1:s,y1:a,x2:y0,y2:D,stroke:P,strokeWidth:.6,strokeDasharray:"4 3",opacity:.4})]}),e.jsx("circle",{cx:y0,cy:D,r:5,className:"edge-handle edge-handle-bezier",style:{pointerEvents:"none"}})]}),m==="orthogonal"&&u&&!A&&e.jsx("path",{d:K0,fill:"none",stroke:"transparent",strokeWidth:16,style:{pointerEvents:"stroke",cursor:"crosshair"},onPointerDown:X=>{X.stopPropagation(),X.nativeEvent.stopImmediatePropagation()},onClick:k0}),m==="orthogonal"&&u&&(M.length<=1?e.jsx("rect",{className:"edge-handle edge-handle-ortho",x:z0-5,y:He-5,width:10,height:10,rx:2,style:{pointerEvents:"none"}}):e.jsx(e.Fragment,{children:M.map((X,p0)=>e.jsx("rect",{className:"edge-handle edge-handle-ortho",x:X.x-5,y:X.y-5,width:10,height:10,rx:2,style:{pointerEvents:"none"}},p0))})),e.jsxs(Ks,{children:[m==="waypoints"&&u&&!A&&M.map((X,p0)=>e.jsx("div",{className:"nopan nodrag",style:{...Ge,transform:`translate(-50%, -50%) translate(${X.x}px, ${X.y}px)`,cursor:"move"},onPointerDown:G0=>$0(G0,p0),onPointerMove:ye,onPointerUp:t0,onDoubleClick:G0=>K(G0,p0)},`wp-${n}-${p0}`)),m==="bezier"&&u&&!A&&e.jsx("div",{className:"nopan nodrag",style:{...Ge,transform:`translate(-50%, -50%) translate(${y0}px, ${D}px)`,cursor:"move"},onPointerDown:X=>$0(X,0),onPointerMove:y,onPointerUp:t0}),m==="orthogonal"&&u&&!A&&(M.length<=1?e.jsx("div",{className:"nopan nodrag",style:{...Ge,transform:`translate(-50%, -50%) translate(${z0}px, ${He}px)`,cursor:ne?"ew-resize":"ns-resize"},onPointerDown:X=>$0(X,0),onPointerMove:Y,onPointerUp:t0,onDoubleClick:X=>K(X,0)}):e.jsx(e.Fragment,{children:M.map((X,p0)=>e.jsx("div",{className:"nopan nodrag",style:{...Ge,transform:`translate(-50%, -50%) translate(${X.x}px, ${X.y}px)`,cursor:"move"},onPointerDown:G0=>$0(G0,p0),onPointerMove:ye,onPointerUp:t0,onDoubleClick:G0=>K(G0,p0)},`ortho-${n}-${p0}`))})),W0?e.jsx("div",{className:"nodrag nopan",style:{position:"absolute",transform:`translate(-50%, -50%) translate(${ue}px, ${we}px)`,pointerEvents:"all"},children:e.jsx("input",{ref:M0,className:"edge-label-input",value:U0,onChange:X=>F0(X.target.value),onBlur:ln,onKeyDown:X=>{X.key==="Enter"?ln():X.key==="Escape"&&cn(),X.stopPropagation()},onClick:X=>X.stopPropagation()})}):e.jsxs("div",{className:"edge-label nodrag nopan",style:{position:"absolute",transform:`translate(-50%, -50%) translate(${ue}px, ${we}px)`,pointerEvents:u||A0?"all":"none",display:"flex",flexDirection:"column",alignItems:"center",gap:"2px",cursor:u?"text":"default"},onDoubleClick:u?dn:void 0,children:[B&&e.jsx("span",{style:{pointerEvents:"none"},children:B}),A0&&e.jsx("span",{className:"edge-quick-note",style:{pointerEvents:"none"},children:A0}),A&&e.jsx("span",{className:"edge-captured-badge",title:"Both endpoints captured by a locked region",style:{pointerEvents:"none"},children:e.jsx(Pr,{size:9})})]})]})]})}const ll=o.memo(dl),cl=[{label:"1–3",width:.8},{label:"4–7",width:1.5},{label:"8–10",width:2.5}];function ul({edges:n}){const{activeEdgeParamDefs:r}=Se(),t=r.find(l=>l.drivesWidth);if(!t)return null;const s=n.map(l=>{const d=l.paramValues.find(u=>u.paramDefId===t.id&&u.isEnabled);return d?.value!=null&&d.value!==""?Number(d.value):null}).filter(l=>l!=null&&!Number.isNaN(l));if(s.length===0)return null;const a=Math.min(...s),i=Math.max(...s);return e.jsxs("div",{className:"edge-weight-legend",children:[e.jsx("div",{className:"edge-weight-legend__title",children:t.displayName}),cl.map(l=>e.jsxs("div",{className:"edge-weight-legend__row",children:[e.jsx("svg",{width:26,height:8,className:"edge-weight-legend__sample",children:e.jsx("line",{x1:1,y1:4,x2:25,y2:4,stroke:"var(--text)",strokeWidth:l.width})}),e.jsx("span",{className:"edge-weight-legend__label",children:l.label})]},l.label)),e.jsx("div",{className:"edge-weight-legend__range",children:a===i?`= ${a}`:`${a}–${i}`})]})}function pl(){const{apiEnabled:n}=Se();return n?e.jsxs("div",{className:"api-status-badge",title:"HTTP API enabled — listening on 127.0.0.1:57321",children:[e.jsx("span",{className:"api-status-badge__dot"}),"API"]}):null}function ml(n){const{enabled:r,wsUrl:t,name:s,selection:a}=n,[i,l]=o.useState(new Map),d=o.useRef(null),u=o.useRef(crypto.randomUUID?crypto.randomUUID():"u"+Math.random().toString(16).slice(2)),g=o.useRef(0),h=o.useRef({x:0,y:0}),c=o.useRef(s);c.current=s;const b=o.useRef(a??[]),x=o.useRef(null),m=o.useCallback((v,f)=>{const I=d.current;!I||I.readyState!==WebSocket.OPEN||I.send(JSON.stringify({name:c.current,x:v,y:f,sel:b.current,marquee:x.current}))},[]);o.useEffect(()=>{if(!r||!t)return;let v=!1,f=null;const I=()=>{if(v)return;let p;try{p=new WebSocket(t)}catch{f=setTimeout(I,1500);return}d.current=p,p.onopen=()=>m(h.current.x,h.current.y),p.onmessage=A=>{try{const F=JSON.parse(A.data);if(!F)return;if(F.type==="welcome"){u.current=F.id;return}if(F.id===u.current)return;l(Z=>{const H=new Map(Z);return H.set(F.id,{id:F.id,name:F.name||"Guest",color:F.color||"#888",x:F.x,y:F.y,sel:Array.isArray(F.sel)?F.sel:[],marquee:F.marquee??null,t:Date.now()}),H})}catch{}},p.onclose=()=>{d.current===p&&(d.current=null),v||(f=setTimeout(I,1500))},p.onerror=()=>{try{p.close()}catch{}}};return I(),()=>{v=!0,f&&clearTimeout(f);const p=d.current;if(p)try{p.close()}catch{}d.current=null,l(new Map)}},[r,t,m]),o.useEffect(()=>{b.current=a??[],r&&m(h.current.x,h.current.y)},[a,r,m]),o.useEffect(()=>{if(!r)return;const v=setInterval(()=>{m(h.current.x,h.current.y),l(f=>{const I=Date.now();let p=!1;const A=new Map(f);for(const[F,Z]of A)I-Z.t>1e4&&(A.delete(F),p=!0);return p?A:f})},2e3);return()=>clearInterval(v)},[r,m]);const k=o.useCallback((v,f,I=null)=>{h.current={x:v,y:f};const p=I==null!=(x.current==null);x.current=I;const A=Date.now();!p&&A-g.current<45||(g.current=A,m(v,f))},[m]),w=o.useMemo(()=>Array.from(i.values()),[i]),E=o.useMemo(()=>{const v=[];for(const f of i.values())for(const I of f.sel)v.push(`${I}:${f.color}:${f.name}`);return v.sort().join("|")},[i]),j=o.useMemo(()=>{const v=new Map;for(const f of i.values())for(const I of f.sel)v.has(I)||v.set(I,{color:f.color,name:f.name});return v},[E]);return{peers:w,sendCursor:k,remoteSelections:j}}const fl=[],hl=new Map,gl={remoteSelections:hl,sendCursor:()=>{}},us=o.createContext(fl),ps=o.createContext(gl);function zr(){return o.useContext(us)}function ms(){return o.useContext(ps)}function bl({enabled:n,wsUrl:r,name:t,selection:s,children:a}){const i=ml({enabled:n,wsUrl:r,name:t,selection:s}),l=o.useMemo(()=>({remoteSelections:i.remoteSelections,sendCursor:i.sendCursor}),[i.remoteSelections,i.sendCursor]);return e.jsx(ps.Provider,{value:l,children:e.jsx(us.Provider,{value:i.peers,children:a})})}function tt(n,r){const t=d=>d.width*d.height,s=new Map,a=new Map,i=(d,u)=>{const g=a.get(d);g?g.push(u):a.set(d,[u])},l=(d,u)=>{let g=null;for(const h of r)h.id===d||!u(h)||(!g||t(h)<t(g))&&(g=h);return g?g.id:null};for(const d of n){const u=l(d.id,g=>Hn(d,g));s.set(d.id,u),u&&i(u,d.id)}for(const d of r){const u=l(d.id,g=>Qa(d,g));s.set(d.id,u),u&&i(u,d.id)}return{parentOf:s,childrenOf:a}}function ra(n,r,t){const s=new Set,a=[n];for(;a.length;){const i=a.pop();for(const l of r.childrenOf.get(i)??[])s.has(l)||(s.add(l),t.has(l)&&a.push(l))}return s}function xl(){const n=zr(),{sendCursor:r}=ms(),{screenToFlowPosition:t}=Oe(),s=mt(i=>i.transform[2]),a=o.useRef({x:0,y:0});return o.useEffect(()=>{function i(){const u=document.querySelector(".react-flow__selection");if(!u)return null;const g=u.getBoundingClientRect();if(g.width<1||g.height<1)return null;const h=t({x:g.left,y:g.top}),c=t({x:g.right,y:g.bottom});return{x:h.x,y:h.y,w:c.x-h.x,h:c.y-h.y}}function l(u){const g=u.target;if(!g||!g.closest||!g.closest(".react-flow"))return;const h=t({x:u.clientX,y:u.clientY});a.current={x:h.x,y:h.y},r?.(h.x,h.y,i())}function d(){r?.(a.current.x,a.current.y,null)}return document.addEventListener("mousemove",l),document.addEventListener("mouseup",d),()=>{document.removeEventListener("mousemove",l),document.removeEventListener("mouseup",d)}},[r,t]),e.jsxs(ao,{children:[n.map(i=>i.marquee&&e.jsx("div",{className:"presence-marquee",style:{transform:`translate(${i.marquee.x}px, ${i.marquee.y}px)`,width:i.marquee.w,height:i.marquee.h,borderColor:i.color,background:`${i.color}1f`}},`${i.id}-marquee`)),n.map(i=>e.jsxs("div",{className:"presence-cursor",style:{transform:`translate(${i.x}px, ${i.y}px) scale(${1/s})`,transformOrigin:"0 0"},children:[e.jsx("svg",{width:"16",height:"22",viewBox:"0 0 16 22","aria-hidden":!0,children:e.jsx("path",{d:"M1 1 L1 16 L5 12.5 L8 20 L10.5 19 L7.5 11.5 L13 11.5 Z",fill:i.color,stroke:"#0c0c0c",strokeWidth:"1"})}),e.jsx("span",{className:"presence-cursor__name",style:{background:i.color},children:i.name})]},i.id))]})}function vl(){const n=zr(),r=mt(a=>a.transform),[t,s]=o.useState([]);return o.useEffect(()=>{const a=document.querySelector(".react-flow__minimap"),i=a?.querySelector("svg");if(!a||!i||!i.viewBox.baseVal.width||!i.viewBox.baseVal.height){s(g=>g.length?[]:g);return}const l=i.viewBox.baseVal,d=a.getBoundingClientRect(),u=[];for(const g of n){const h=(g.x-l.x)/l.width,c=(g.y-l.y)/l.height;h<0||h>1||c<0||c>1||u.push({id:g.id,color:g.color,x:d.left+h*d.width,y:d.top+c*d.height})}s(u)},[n,r]),t.length?We.createPortal(e.jsx(e.Fragment,{children:t.map(a=>e.jsx("div",{className:"minimap-cursor",style:{left:a.x,top:a.y,background:a.color}},a.id))}),document.body):null}const fs=28,yl={gloNode:tl,region:sl},wl={gloEdge:ll},kl=new Set;function jl({onTier:n}){const r=mt(t=>Dd(t.transform[2]));return o.useEffect(()=>{n(r)},[r,n]),null}const Nl=new Set(["image","video","note","file"]),_l={image:{width:220,height:160},video:{width:260,height:168},note:{width:220,height:120},file:{width:200,height:150}};function Il(n){const r={id:n.id,type:"gloNode",position:{x:n.x,y:n.y},data:n};if(n.kind&&Nl.has(n.kind)){const t=_l[n.kind];r.style={width:n.width??t.width,height:n.height??t.height}}return r}function ta(n,r,t,s){return{id:n.id,source:n.sourceId,target:n.targetId,sourceHandle:n.sourceHandle??void 0,targetHandle:n.targetHandle??void 0,type:"gloEdge",data:{...n,onWaypointsChange:r,onHoverChange:t,onEdgeLabelChange:s}}}function Cl(n,r,t,s,a,i){return{id:n.id,type:"region",position:{x:n.x,y:n.y},style:{width:n.width,height:r?fs:n.height},zIndex:-1,data:{...n,isMinimized:r,isLocked:t,onMinimize:s,onResize:a,onLock:i}}}function aa(n,r){const t=new Set,s=r.x,a=r.y+fs,i=r.x+r.width,l=r.y+r.height;for(const d of n){const u=Math.max(d.x,s),g=Math.max(d.y,a),h=Math.min(d.x+Xe,i),c=Math.min(d.y+en,l);h>u&&c>g&&(h-u)*(c-g)/(Xe*en)>=.75&&t.add(d.id)}return t}function Sl(n,r){const t=new Map,s=new Set(n.map(a=>a.id));for(const[a,i]of r)for(const l of i)s.has(l)&&!t.has(l)&&t.set(l,a);return t}function El(n,r){const t=[];for(const s of n){const a=r.get(s.sourceId),i=r.get(s.targetId);if(!(a&&i&&a===i)){if(!a&&!i){t.push(s);continue}t.push({...s,id:`${s.id}__remap`,sourceId:a??s.sourceId,targetId:i??s.targetId})}}return t}function Dl({pos:n,onClose:r,onOpenCreatePicker:t,onCreateRegion:s}){const{screenToFlowPosition:a}=Oe(),i=()=>a({x:n.x,y:n.y});return We.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"context-menu-overlay",onClick:r,onContextMenu:l=>l.preventDefault()}),e.jsxs("div",{className:"canvas-context-menu",style:{left:n.x,top:n.y},onContextMenu:l=>l.preventDefault(),children:[e.jsxs("button",{className:"context-menu-item",onClick:l=>{l.stopPropagation(),t(n,i()),r()},children:[e.jsx(oe,{size:13}),"Add node here…"]}),e.jsx("hr",{className:"context-menu-separator"}),e.jsxs("button",{className:"context-menu-item",onClick:l=>{l.stopPropagation(),s(i()),r()},children:[e.jsx(Ya,{size:13}),"Add node region here"]})]})]}),document.body)}function Tl({pos:n,regionId:r,isLocked:t,isMinimized:s,onClose:a,onLock:i,onMinimize:l,onBringToFront:d,onSendToBack:u,onEdit:g,onDelete:h,onDuplicate:c,onOpenCreatePicker:b}){const{screenToFlowPosition:x}=Oe();return We.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"context-menu-overlay",onClick:a,onContextMenu:m=>m.preventDefault()}),e.jsxs("div",{className:"canvas-context-menu",style:{left:n.x,top:n.y},onContextMenu:m=>m.preventDefault(),children:[e.jsxs("button",{className:"context-menu-item",onClick:()=>{b(n,x({x:n.x,y:n.y}),r),a()},children:[e.jsx(oe,{size:13})," Add node here…"]}),e.jsx("hr",{className:"context-menu-separator"}),e.jsxs("button",{className:"context-menu-item",onClick:()=>{i(r,!t),a()},children:[t?e.jsxs(e.Fragment,{children:[e.jsx(Ba,{size:13})," Unlock Region"]}):e.jsxs(e.Fragment,{children:[e.jsx(Pr,{size:13})," Lock Region"]}),!t&&s&&e.jsx("span",{className:"context-menu-item__note",children:"expands first"})]}),e.jsxs("button",{className:"context-menu-item",onClick:()=>{l(r,!s),a()},children:[s?e.jsxs(e.Fragment,{children:[e.jsx(oe,{size:13})," Expand"]}):e.jsxs(e.Fragment,{children:[e.jsx(Cr,{size:13})," Minimize"]}),!s&&t&&e.jsx("span",{className:"context-menu-item__note",children:"unlocks first"})]}),e.jsx("hr",{className:"context-menu-separator"}),e.jsxs("button",{className:"context-menu-item",onClick:()=>{d(r),a()},children:[e.jsx(Ha,{size:13})," Bring to Front"]}),e.jsxs("button",{className:"context-menu-item",onClick:()=>{u(r),a()},children:[e.jsx(Ja,{size:13})," Send to Back"]}),e.jsx("hr",{className:"context-menu-separator"}),e.jsx("button",{className:"context-menu-item",onClick:()=>{g(r),a()},children:"Edit Region…"}),c&&e.jsxs("button",{className:"context-menu-item",onClick:()=>{c(r),a()},children:[e.jsx(jn,{size:13})," Duplicate Region"]}),e.jsx("hr",{className:"context-menu-separator"}),e.jsxs("button",{className:"context-menu-item context-menu-item--danger",onClick:()=>{h(r),a()},children:[e.jsx(Ve,{size:13})," Delete Region"]})]})]}),document.body)}function Ml({pos:n,nodeId:r,onClose:t,onFindRelated:s,onTrace:a,onBringToFront:i,onSendToBack:l,onDuplicate:d,onDelete:u,selectionCount:g=1}){return We.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"context-menu-overlay",onClick:t,onContextMenu:h=>h.preventDefault()}),e.jsxs("div",{className:"canvas-context-menu",style:{left:n.x,top:n.y},onContextMenu:h=>h.preventDefault(),children:[e.jsxs("button",{className:"context-menu-item",onClick:()=>{s(r),t()},children:[e.jsx(Ua,{size:13}),"Select Connected"]}),a&&e.jsxs(e.Fragment,{children:[e.jsxs("button",{className:"context-menu-item",onClick:()=>{a(r,"downstream"),t()},children:[e.jsx(Ir,{size:13}),"Trace impact (downstream)"]}),e.jsxs("button",{className:"context-menu-item",onClick:()=>{a(r,"upstream"),t()},children:[e.jsx(Va,{size:13}),"Trace causes (upstream)"]})]}),e.jsx("hr",{className:"context-menu-separator"}),i&&e.jsxs("button",{className:"context-menu-item",onClick:()=>{i(r),t()},children:[e.jsx(Ha,{size:13}),"Bring to Front"]}),l&&e.jsxs("button",{className:"context-menu-item",onClick:()=>{l(r),t()},children:[e.jsx(Ja,{size:13}),"Send to Back"]}),(d||u)&&e.jsx("hr",{className:"context-menu-separator"}),d&&e.jsxs("button",{className:"context-menu-item",onClick:()=>{d(r),t()},children:[e.jsx(jn,{size:13}),g>1?`Duplicate (${g})`:"Duplicate"]}),u&&e.jsxs("button",{className:"context-menu-item context-menu-item--danger",onClick:()=>{u(r),t()},children:[e.jsx(Ve,{size:13}),g>1?`Delete (${g})`:"Delete"]})]})]}),document.body)}function Ol({pos:n,edgeId:r,hasWaypoints:t,onClose:s,onDelete:a,onClearWaypoints:i}){return We.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"context-menu-overlay",onClick:s,onContextMenu:l=>l.preventDefault()}),e.jsxs("div",{className:"canvas-context-menu",style:{left:n.x,top:n.y},onContextMenu:l=>l.preventDefault(),children:[t&&e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"context-menu-item",onClick:()=>{i(r),s()},children:"Clear Waypoints"}),e.jsx("hr",{className:"context-menu-separator"})]}),e.jsxs("button",{className:"context-menu-item context-menu-item--danger",onClick:()=>{a(r),s()},children:[e.jsx(Ve,{size:13}),"Delete Edge"]})]})]}),document.body)}function Pl({trigger:n}){const{setNodes:r,setEdges:t}=Oe(),s=o.useRef(n);return o.useEffect(()=>{n!==s.current&&(s.current=n,r(a=>a.map(i=>({...i,selected:!0}))),t(a=>a.map(i=>({...i,selected:!0}))))},[n,r,t]),null}function Rl({trigger:n,regionId:r,nodes:t,regions:s}){const{setNodes:a}=Oe(),i=o.useRef(n);return o.useEffect(()=>{if(n===i.current||(i.current=n,!r))return;const l=s.find(g=>g.id===r);if(!l)return;const d=new Ce(l),u=new Set(t.filter(g=>d.contains(new Me(g))).map(g=>g.id));a(g=>g.map(h=>({...h,selected:u.has(h.id)})))},[n,r,t,s,a]),null}function zl({trigger:n}){const{fitView:r,getNodes:t}=Oe(),s=o.useRef(n);return o.useEffect(()=>{if(n===s.current)return;s.current=n;const a=t().filter(i=>i.selected&&i.type!=="region");a.length>0?r({nodes:a,padding:.25,duration:400}):r({padding:.15,duration:400})},[n,r,t]),null}function Al({targetViewport:n,onTargetConsumed:r}){const{setViewport:t}=Oe(),s=o.useRef(null);return o.useEffect(()=>{!n||n===s.current||(s.current=n,t(n,{duration:400}),r())},[n,t,r]),null}function $l({onPaneDoubleClick:n}){const{screenToFlowPosition:r}=Oe();return o.useEffect(()=>{function t(s){if(!s.target.classList.contains("react-flow__pane"))return;const a=r({x:s.clientX,y:s.clientY});n(a)}return document.addEventListener("dblclick",t),()=>document.removeEventListener("dblclick",t)},[n,r]),null}function Ll({targetRef:n}){const{screenToFlowPosition:r}=Oe();return o.useEffect(()=>(n.current=r,()=>{n.current=null}),[n,r]),null}function Vl({trigger:n}){const{fitView:r}=Oe(),t=o.useRef(n);return o.useEffect(()=>{n!==t.current&&(t.current=n,r({duration:400,padding:.15}))},[n,r]),null}function Hl({pos:n,onDone:r}){const{setCenter:t}=Oe();return o.useEffect(()=>{const s=setTimeout(()=>{t(n.x,n.y,{duration:500,zoom:1.1}),r()},80);return()=>clearTimeout(s)},[n.x,n.y,t,r]),null}function Fl({nodes:n,edges:r,regions:t,minimizedRegionIds:s,lockedRegionIds:a,selectedNodeId:i,selectedEdgeId:l,selectedRegionId:d,onNodeSelect:u,onEdgeSelect:g,onRegionSelect:h,onConnect:c,onEdgeReconnect:b,onEdgeDelete:x,onEdgeWaypointsChange:m,onEdgeLabelChange:k,onNodeMove:w,onNodeDoubleClick:E,onRegionMinimize:j,onRegionLock:v,onRegionMove:f,onRegionResize:I,onPaneClick:p,onPaneDoubleClick:A,readOnly:F,onContextMenuCreateRegion:Z,onOpenCreatePicker:H,onSelectionChange:J,onMultiSelectionOrderChange:C,onSelectionDragVector:z,onViewportChange:L,onFindRelated:P,onTrace:W,traceNodeIds:_=new Set,traceEdgeIds:a0=new Set,traceSeedId:c0=null,onNodeBringToFront:B,onNodeSendToBack:S,onNodeDuplicate:E0,onNodeDelete:Y0,scrollToPos:A0,onScrolled:I0,fitViewTrigger:q0=0,selectAllTrigger:W0=0,zoomToSelectionTrigger:H0=0,viewportRef:U0,screenToFlowRef:F0,targetViewport:M0,onTargetViewportConsumed:M,highlightedNodeIds:O,flashingNodeId:$,onRegionEdit:V,onRegionDelete:d0,onRegionDuplicate:m0,onRegionBringToFront:R0,onRegionSendToBack:J0,selectRegionTrigger:g0=0,pinnedNodeIds:N0=new Set,pinnedExpandIds:O0=new Set,expandOverrides:Q0=new Map,onTogglePinnedExpand:X0,onTogglePin:ee,onNoteChange:B0,onToggleRenderMarkdown:y0,onToggleShowThumbnail:D,onNodeResize:i0,inSession:n0}){const{getNodeColor:C0,snapToGrid:P0}=Se(),{remoteSelections:_0}=ms(),[D0,G]=o.useState(new Set);o.useEffect(()=>{(i||l||d)&&G(T=>T.size>0?new Set:T)},[i,l,d]);const h0=o.useRef(C);h0.current=C,o.useEffect(()=>{h0.current?.(Array.from(D0))},[D0]);const L0=o.useRef(null),ne=o.useRef(z);ne.current=z,o.useEffect(()=>{function T(U){L0.current={x:U.clientX,y:U.clientY}}function R(U){const q=L0.current;q&&(ne.current?.(U.clientX-q.x,U.clientY-q.y),L0.current=null)}return window.addEventListener("mousedown",T),window.addEventListener("mouseup",R),()=>{window.removeEventListener("mousedown",T),window.removeEventListener("mouseup",R)}},[]);const Ee=o.useRef(j);Ee.current=j;const De=o.useRef(I);De.current=I;const Ue=o.useRef(v);Ue.current=v;const K0=o.useRef(n);K0.current=n;const z0=o.useRef(t);z0.current=t;const He=o.useRef(r);He.current=r;const re=o.useRef(a);re.current=a;const ue=o.useRef(s);ue.current=s;const[ge,be]=o.useState(new Map),$0=o.useRef(new Map),ye=o.useRef(null),[y,Y]=o.useState(new Set),t0=o.useMemo(()=>{const T=new Set;for(const[,R]of $0.current)for(const U of r)R.has(U.sourceId)&&R.has(U.targetId)&&T.add(U.id);return T},[y,r]),K=o.useCallback(()=>{const{parentOf:T}=tt(K0.current,z0.current),R=re.current,U=ue.current,q=new Set;for(const[o0,x0]of T)x0&&R.has(x0)&&!U.has(x0)&&q.add(o0);Y(q)},[]);o.useEffect(()=>{K()},[n,t,a,s,K]),o.useEffect(()=>{let T=!1;for(const R of[...$0.current.keys()])a.has(R)||($0.current.delete(R),T=!0);for(const R of a)if(!$0.current.has(R)){const U=z0.current.find(q=>q.id===R);if(U){const q=new Ce(U),o0=new Set;for(const x0 of K0.current)q.contains(new Me(x0))&&o0.add(x0.id);for(const x0 of z0.current)q.contains(new Ce(x0))&&o0.add(x0.id);$0.current.set(R,o0),T=!0}}T&&K()},[a,K]),o.useEffect(()=>{be(T=>{let R=!1;const U=new Map(T);for(const q of[...U.keys()])s.has(q)||(U.delete(q),R=!0);for(const q of s)if(!U.has(q)){const o0=z0.current.find(x0=>x0.id===q);o0&&(U.set(q,aa(K0.current,o0)),R=!0)}return R?U:T})},[s]),o.useEffect(()=>{const T=new Set(n.map(o0=>o0.id)),R=new Set(t.map(o0=>o0.id)),U=new Set([...T,...R]);let q=!1;for(const[,o0]of $0.current)for(const x0 of[...o0])U.has(x0)||(o0.delete(x0),q=!0);q&&K(),be(o0=>{let x0=!1;const ae=new Map;for(const[T0,pe]of o0){const se=new Set;for(const je of pe)T.has(je)?se.add(je):x0=!0;ae.set(T0,se)}return x0?ae:o0})},[n,t,K]);const k0=o.useCallback((T,R)=>{if(R){if(re.current.has(T)){const q=new Map($0.current);q.delete(T),$0.current=q,K(),Ue.current(T,!1)}const U=z0.current.find(q=>q.id===T);if(U){const q=aa(K0.current,U);be(o0=>new Map(o0).set(T,q))}}else be(U=>{const q=new Map(U);return q.delete(T),q});Ee.current(T,R)},[K]),b0=o.useCallback((T,R,U,q,o0)=>{if(re.current.has(T)){const x0=new Ce({id:T,x:R,y:U,width:q,height:o0}),ae=new Set;for(const T0 of K0.current)x0.contains(new Me(T0))&&ae.add(T0.id);for(const T0 of z0.current)x0.contains(new Ce(T0))&&ae.add(T0.id);$0.current=new Map($0.current).set(T,ae),K()}De.current(T,R,U,q,o0)},[K]),we=o.useCallback((T,R)=>{if(R){ue.current.has(T)&&(be(q=>{const o0=new Map(q);return o0.delete(T),o0}),Ee.current(T,!1));const U=z0.current.find(q=>q.id===T);if(U){const q=new Ce(U),o0=new Set;for(const x0 of K0.current)q.contains(new Me(x0))&&o0.add(x0.id);for(const x0 of z0.current)q.contains(new Ce(x0))&&o0.add(x0.id);$0.current=new Map($0.current).set(T,o0)}}else{const U=new Map($0.current);U.delete(T),$0.current=U}K(),Ue.current(T,R)},[K]),[dn,ln]=o.useState(new Set),cn=o.useRef(null),[Ge,X]=o.useState(null),p0=o.useMemo(()=>Sl(n,ge),[n,ge]),G0=o.useMemo(()=>n.map(T=>{const R=D0.size>0?D0.has(T.id):T.id===i,U=Il(T),q=_0?.get(T.id);return{...U,selected:R,draggable:!F&&!N0.has(T.id),className:[dn.has(T.id)?"node--snap-back":"",q?"node--remote-selected":""].filter(Boolean).join(" "),style:q?{...U.style,"--remote-sel-color":q.color}:U.style,zIndex:T.id===Ge?100001:R?1e5:1e3+(T.zOrder??0)}}),[n,i,D0,N0,dn,Ge,F,_0]),ie=o.useRef(m);ie.current=m;const te=o.useCallback((T,R)=>ie.current(T,R),[]),qe=o.useRef(k);qe.current=k;const de=o.useCallback((T,R)=>qe.current?.(T,R),[]),[ke,$r]=o.useState(null),[rr,tr]=o.useState(null),Bn=O0,ar=o.useCallback(T=>{X0?.(T)},[X0]),sr=o.useCallback(T=>{ee?.(T)},[ee]),or=o.useCallback((T,R)=>{B0?.(T,R)},[B0]),Wn=o.useCallback(T=>{y0?.(T)},[y0]),In=o.useCallback(T=>{D?.(T)},[D]),un=o.useCallback((T,R,U,q,o0)=>{i0?.(T,R,U,q,o0)},[i0]),_e=o.useCallback((T,R)=>$r(R?T:null),[]),Cn=o.useMemo(()=>r.map(T=>({...ta(T,te,_e,de),selected:T.id===l})),[r,l,te,_e,de]),Un=o.useMemo(()=>{const T=[...t].sort((U,q)=>{if(U.zOrder!==q.zOrder)return U.zOrder-q.zOrder;const o0=q.width*q.height-U.width*U.height;return o0!==0?o0:U.id===d?1:q.id===d?-1:0}),R=new Map;return T.forEach((U,q)=>R.set(U.id,q-T.length)),R},[t,d]),Gn=o.useMemo(()=>t.map(T=>{const R=Cl(T,s.has(T.id),a.has(T.id),k0,b0,we),U=_0?.get(T.id);return{...R,selected:D0.size>0?D0.has(T.id):T.id===d,className:U?"region--remote-selected":void 0,style:U?{...R.style,"--remote-sel-color":U.color}:R.style,zIndex:Un.get(T.id)??-1}}),[t,s,a,k0,b0,we,D0,d,Un,_0]),pn=o.useMemo(()=>new Set(p0.keys()),[p0]),mn=o.useMemo(()=>[...Gn,...G0.filter(T=>!pn.has(T.id))],[Gn,G0,pn]),Pe=o.useMemo(()=>{const T=p0.size===0?Cn:El(r,p0).map(R=>({...ta(R,te,_e,de),selected:!1,reconnectable:!R.id.endsWith("__remap")}));return!_0||_0.size===0?T:T.map(R=>{const U=_0.get(R.id.replace(/__remap$/,""));return U?{...R,data:{...R.data,remoteSelColor:U.color}}:R})},[r,Cn,p0,te,_e,de,_0]),ir=o.useMemo(()=>{const T=new Map;for(const R of r)T.set(R.sourceId,(T.get(R.sourceId)??0)+1),T.set(R.targetId,(T.get(R.targetId)??0)+1);return T},[r]),fe=o.useMemo(()=>{if(!ke)return new Set;const T=ke.replace(/__remap$/,""),R=r.find(U=>U.id===T);return R?new Set([R.sourceId,R.targetId]):new Set},[ke,r]),[j0,Re,fn]=Zs(mn),[qn,dr,Lr]=Js(Pe),[lr,cr]=o.useState(null),[ur,Fe]=o.useState(null),[Sn,En]=o.useState(null),[pr,Dn]=o.useState(null),[Tn,Mn]=o.useState(null),mr=o.useRef({selectedNodeId:i,selectedRegionId:d,multiSelectedIds:D0});o.useEffect(()=>{const T=mr.current,R=i!==T.selectedNodeId||d!==T.selectedRegionId||D0!==T.multiSelectedIds;mr.current={selectedNodeId:i,selectedRegionId:d,multiSelectedIds:D0},Re(R?mn:U=>{const q=new Map(U.map(o0=>[o0.id,o0.selected]));return mn.map(o0=>{const x0=q.get(o0.id);return x0===void 0||x0===o0.selected?o0:{...o0,selected:x0}})})},[mn]),o.useEffect(()=>dr(Pe),[Pe]);const Vr=o.useCallback(T=>{T.source&&T.target&&c(T.source,T.target,T.sourceHandle,T.targetHandle)},[c]),On=o.useRef(!1),Hr=o.useCallback((T,R)=>{if(On.current=!0,!R.source||!R.target)return;const U=T.id.replace(/__remap$/,"");b(U,R.source,R.target,R.sourceHandle,R.targetHandle)},[b]),Fr=o.useCallback(()=>{On.current=!1},[]),fr=o.useCallback((T,R)=>{On.current||x(R.id.replace(/__remap$/,""))},[x]),Br=o.useCallback((T,R)=>{if(R.type!=="region"||!re.current.has(R.id))return;const U=z0.current.find(ae=>ae.id===R.id);if(!U)return;const q=R.position.x-U.x,o0=R.position.y-U.y;if(!ye.current||ye.current.id!==R.id){const ae=new Set(z0.current.map(pe=>pe.id)),T0=tt(K0.current,z0.current);ye.current={id:R.id,members:ra(R.id,T0,ae)}}const x0=ye.current.members;x0.size&&(Re(ae=>ae.map(T0=>{if(!x0.has(T0.id))return T0;const pe=K0.current.find(je=>je.id===T0.id);if(pe)return{...T0,position:{x:pe.x+q,y:pe.y+o0}};const se=z0.current.find(je=>je.id===T0.id);return se?{...T0,position:{x:se.x+q,y:se.y+o0}}:T0})),cr({dx:q,dy:o0,memberIds:x0}))},[]),Kn=o.useCallback((T,R,U)=>{const q=z0.current.find(T0=>T0.id===T),o0=q?void 0:K0.current.find(T0=>T0.id===T),x0=q?new Ce(q):o0?new Me(o0):void 0;if(!x0)return!1;let ae=!1;for(const T0 of z0.current){if(T0.id===T||!re.current.has(T0.id)||ue.current.has(T0.id))continue;const pe=new Set($0.current.get(T0.id)??new Set),se=new Ce(T0).contains(x0,{x:R,y:U}),je=pe.has(T);se!==je&&(se?pe.add(T):pe.delete(T),$0.current=new Map($0.current).set(T0.id,pe),ae=!0)}return ae},[]),Wr=o.useCallback((T,R,U)=>{cr(null),ye.current=null;const q=[],o0=[];let x0=!1;const ae=tt(K0.current,z0.current),T0=new Set(z0.current.map(v0=>v0.id)),pe=new Map,se=v0=>{let V0=pe.get(v0);return V0||(V0=ra(v0,ae,T0),pe.set(v0,V0)),V0},je=U.filter(v0=>v0.type==="region"&&re.current.has(v0.id)),Pn=new Set;for(const v0 of je)for(const V0 of se(v0.id))Pn.add(V0);for(const v0 of U)if(v0.type==="region"){if(re.current.has(v0.id)){const V0=se(v0.id),xe=z0.current.find(he=>he.id===v0.id);if(xe&&V0.size){const he=v0.position.x-xe.x,Rn=v0.position.y-xe.y;for(const Be of V0){const nn=K0.current.find(ze=>ze.id===Be);if(nn)q.push({id:nn.id,x:nn.x+he,y:nn.y+Rn});else{const ze=z0.current.find(Kr=>Kr.id===Be);ze&&f(ze.id,ze.x+he,ze.y+Rn)}}for(const Be of He.current)if(V0.has(Be.sourceId)&&V0.has(Be.targetId)&&Be.waypoints?.length){const nn=Be.waypoints.map(ze=>({x:ze.x+he,y:ze.y+Rn}));ie.current(Be.id,nn)}}}else if(je.length>0&&!Pn.has(v0.id)){const V0=z0.current.find(xe=>xe.id===v0.id);V0&&Re(xe=>xe.map(he=>he.id===v0.id?{...he,position:{x:V0.x,y:V0.y}}:he));continue}Kn(v0.id,v0.position.x,v0.position.y)&&(x0=!0),f(v0.id,v0.position.x,v0.position.y)}else{if(je.length>0&&!Pn.has(v0.id)){const V0=K0.current.find(xe=>xe.id===v0.id);V0&&(Re(xe=>xe.map(he=>he.id===v0.id?{...he,position:{x:V0.x,y:V0.y}}:he)),o0.push(v0.id));continue}Kn(v0.id,v0.position.x,v0.position.y)&&(x0=!0),Pn.has(v0.id)||q.push({id:v0.id,x:v0.position.x,y:v0.position.y})}if(x0&&K(),q.length){const v0=U.filter(V0=>V0.type!=="region").map(V0=>V0.id);w(q,v0)}o0.length&&(ln(new Set(o0)),cn.current&&clearTimeout(cn.current),cn.current=setTimeout(()=>ln(new Set),400))},[w,f,K,Kn]);function Ur(T){T.preventDefault(),Fe({x:T.clientX,y:T.clientY})}function Zn(){Fe(null),En(null),Dn(null),Mn(null),G(T=>T.size>0?new Set:T),X(null),p()}const[hr,Gr]=o.useState(Rr),qr=o.useMemo(()=>({capturedIds:y,capturedEdgeIds:t0,regionDragOffset:lr,highlightedNodeIds:O??kl,traceNodeIds:_,traceEdgeIds:a0,traceSeedId:c0,edgeCountByNodeId:ir,hoveredEndpointIds:fe,pinnedNodeIds:N0,connectingFromNodeId:rr,pinnedExpandIds:Bn,expandOverrides:Q0,togglePinnedExpand:ar,togglePin:sr,flashingNodeId:$??null,updateNoteText:or,toggleRenderMarkdown:Wn,toggleShowThumbnail:In,resizeNode:un,lodTier:hr,readOnly:!!F}),[y,t0,lr,O,_,a0,c0,ir,fe,N0,rr,Bn,Q0,ar,sr,$,or,Wn,In,un,hr,F]);return e.jsx(os.Provider,{value:qr,children:e.jsxs("div",{className:"graph-canvas",children:[n.length===0&&t.length===0&&e.jsx("div",{className:"canvas-empty",children:e.jsxs("p",{children:["Double-click the canvas or press ",e.jsx("strong",{children:"N"})," to add a node · right-click for more"]})}),e.jsxs(Ys,{nodesDraggable:!F,nodesConnectable:!F,nodes:j0,edges:qn,onNodesChange:fn,onEdgesChange:Lr,onConnect:Vr,onConnectStart:(T,R)=>tr(R.nodeId??null),onConnectEnd:()=>tr(null),onReconnect:Hr,onReconnectStart:Fr,onReconnectEnd:fr,selectionMode:Xs.Partial,onNodeDrag:Br,onNodeDragStop:Wr,onNodeClick:(T,R)=>{if(Fe(null),T.shiftKey||T.ctrlKey||T.metaKey){const U=i??d;G(q=>{const o0=new Set(q);return o0.size===0&&U&&o0.add(U),o0.has(R.id)?o0.delete(R.id):o0.add(R.id),o0});return}if(G(U=>U.size>0?new Set:U),R.type==="region"){const U=t.find(q=>q.id===R.id);U&&h(U)}else{X(R.id);const U=n.find(q=>q.id===R.id);U&&u(U)}},onNodeDragStart:(T,R)=>{if(R.type!=="region"&&X(R.id),!(j0.filter(q=>q.selected).length>1&&R.selected))if(G(q=>q.size>0?new Set:q),R.type==="region"){const q=t.find(o0=>o0.id===R.id);q&&h(q)}else{const q=n.find(o0=>o0.id===R.id);q&&u(q)}},onNodeDoubleClick:(T,R)=>{if(R.type==="region")return;const U=n.find(q=>q.id===R.id);U&&E(U)},onEdgeClick:(T,R)=>{if(Fe(null),T.shiftKey)return;const U=R.id.replace(/__remap$/,""),q=r.find(o0=>o0.id===U);q&&g(q)},onNodeContextMenu:(T,R)=>{if(T.preventDefault(),Fe(null),En(null),Mn(null),R.type==="region")Dn({x:T.clientX,y:T.clientY,regionId:R.id});else if(P){const U=j0.filter(q=>q.selected&&q.type!=="region").length;Mn({x:T.clientX,y:T.clientY,nodeId:R.id,selectionCount:R.selected&&U>1?U:1})}},onEdgeContextMenu:(T,R)=>{T.preventDefault(),Fe(null),Dn(null);const U=R.id.replace(/__remap$/,""),q=r.find(o0=>o0.id===U);En({x:T.clientX,y:T.clientY,edgeId:U,hasWaypoints:!!q?.waypoints?.length})},onPaneClick:Zn,onPaneContextMenu:Ur,onSelectionChange:({nodes:T,edges:R})=>J?.(T.map(U=>U.id),R.map(U=>U.id)),nodeTypes:yl,edgeTypes:wl,connectionMode:Qs.Loose,isValidConnection:T=>{if(T.source===T.target)return!1;const R=j0.find(q=>q.id===T.source),U=j0.find(q=>q.id===T.target);return R?.type!=="region"&&U?.type!=="region"},selectionOnDrag:!0,elevateNodesOnSelect:!1,onlyRenderVisibleElements:!0,panOnDrag:[1,2],fitView:!0,fitViewOptions:{padding:.2},minZoom:.1,maxZoom:2,defaultEdgeOptions:{type:"gloEdge",reconnectable:!0},deleteKeyCode:null,snapToGrid:P0,snapGrid:[24,24],onMoveEnd:(T,R)=>{U0&&(U0.current=R),L?.(R.zoom)},onMove:(T,R)=>{U0&&(U0.current=R),L?.(R.zoom)},children:[ur&&e.jsx(Dl,{pos:ur,onClose:()=>Fe(null),onOpenCreatePicker:H,onCreateRegion:Z}),Sn&&e.jsx(Ol,{pos:Sn,edgeId:Sn.edgeId,hasWaypoints:Sn.hasWaypoints,onClose:()=>En(null),onDelete:x,onClearWaypoints:T=>m(T,null)}),pr&&(()=>{const T=pr;return e.jsx(Tl,{pos:T,regionId:T.regionId,isLocked:a.has(T.regionId),isMinimized:s.has(T.regionId),onClose:()=>Dn(null),onOpenCreatePicker:H,onLock:we,onMinimize:k0,onBringToFront:R=>{R0?.(R)},onSendToBack:R=>{J0?.(R)},onEdit:R=>{V?.(R)},onDelete:R=>{d0?.(R)},onDuplicate:m0?R=>{m0(R)}:void 0})})(),Tn&&P&&e.jsx(Ml,{pos:Tn,nodeId:Tn.nodeId,onClose:()=>Mn(null),onFindRelated:P,onTrace:W,onBringToFront:B,onSendToBack:S,onDuplicate:E0,onDelete:Y0,selectionCount:Tn.selectionCount}),n0&&e.jsx(xl,{}),n0&&e.jsx(vl,{}),e.jsx(Vl,{trigger:q0}),e.jsx(jl,{onTier:Gr}),F0&&e.jsx(Ll,{targetRef:F0}),!F&&A&&e.jsx($l,{onPaneDoubleClick:A}),e.jsx(Pl,{trigger:W0}),e.jsx(zl,{trigger:H0}),e.jsx(Rl,{trigger:g0,regionId:d,nodes:n,regions:t}),e.jsx(Al,{targetViewport:M0,onTargetConsumed:M??(()=>{})}),A0&&I0&&e.jsx(Hl,{pos:A0,onDone:I0}),e.jsx(eo,{variant:no.Dots,gap:24,size:1,color:"#282828"}),e.jsx(ro,{}),e.jsx(to,{nodeColor:T=>{if(T.type==="region")return t.find(q=>q.id===T.id)?.color??"#333333";const R=n.find(U=>U.id===T.id);return R?C0(R):"#484848"},maskColor:"rgba(15,15,15,0.85)",style:{background:"#1a1a1a",border:"1px solid #484848"}})]}),e.jsx(ul,{edges:r}),e.jsx(pl,{})]})})}function Bl({seedLabel:n,direction:r,reachedCount:t,maxHop:s,onSetDirection:a,onExit:i}){const l=r==="downstream"?"affects":"depends on";return e.jsxs("div",{className:"trace-control",role:"region","aria-label":"Impact trace",children:[e.jsxs("div",{className:"trace-control__head",children:[e.jsx(Ua,{size:13,className:"trace-control__icon","aria-hidden":!0}),e.jsx("span",{className:"trace-control__title",title:n,children:n}),e.jsx("button",{className:"trace-control__close",onClick:i,title:"Exit trace (Esc)","aria-label":"Exit trace",children:e.jsx(S0,{size:13})})]}),e.jsxs("div",{className:"trace-control__dirs",role:"group","aria-label":"Trace direction",children:[e.jsxs("button",{className:`trace-control__dir${r==="downstream"?" trace-control__dir--active":""}`,onClick:()=>a("downstream"),title:"What this node leads to (follows arrows)",children:[e.jsx(Ir,{size:13})," Downstream"]}),e.jsxs("button",{className:`trace-control__dir${r==="upstream"?" trace-control__dir--active":""}`,onClick:()=>a("upstream"),title:"What leads to this node (against arrows)",children:[e.jsx(Va,{size:13})," Upstream"]})]}),e.jsx("p",{className:"trace-control__stat",children:t===0?e.jsxs(e.Fragment,{children:["No nodes ",r==="downstream"?"downstream":"upstream"," — this node ",l," nothing it's linked to."]}):e.jsxs(e.Fragment,{children:["This node ",l," ",e.jsx("strong",{children:t})," node",t===1?"":"s",", up to ",e.jsx("strong",{children:s})," hop",s===1?"":"s"," away."]})})]})}const Jn=[];function Nn({title:n,onClose:r,size:t="md",children:s}){const a=o.useRef(null),i=o.useRef(Symbol("modal"));return o.useEffect(()=>{const l=i.current;return Jn.push(l),()=>{const d=Jn.indexOf(l);d>=0&&Jn.splice(d,1)}},[]),o.useEffect(()=>{function l(d){d.key==="Escape"&&Jn[Jn.length-1]===i.current&&r()}return document.addEventListener("keydown",l,!0),()=>document.removeEventListener("keydown",l,!0)},[r]),e.jsx("div",{className:"modal-backdrop",ref:a,onMouseDown:l=>{l.target===a.current&&r()},children:e.jsxs("div",{className:`modal-panel${t==="sm"?" modal-panel--sm":""}`,role:"dialog","aria-modal":"true",children:[e.jsxs("div",{className:"modal-header",children:[e.jsx("h2",{children:n}),e.jsx("button",{className:"icon-btn",onClick:r,"aria-label":"Close",children:e.jsx(S0,{size:16})})]}),s]})})}const Wl=["Brisk","Calm","Clever","Bright","Swift","Bold","Keen","Lucid","Nimble","Quiet","Sharp","Sunny","Witty","Mellow","Brave","Cosmic","Amber","Coral","Jade","Slate","Vivid","Crisp","Noble","Plucky"],Ul=["Otter","Heron","Falcon","Lynx","Fox","Wren","Marten","Ibis","Tapir","Crane","Bison","Gecko","Raven","Koala","Panther","Stork","Badger","Mantis","Orca","Finch","Hawk","Civet","Egret","Vireo"];function sa(n){return n[Math.floor(Math.random()*n.length)]}function Ln(){const n=1e3+Math.floor(Math.random()*9e3);return`${sa(Wl)}${sa(Ul)}#${n}`}const oa="ABCDEFGHJKMNPQRSTUVWXYZ23456789";function ia(){const n=crypto.getRandomValues(new Uint8Array(12));let r="";for(let t=0;t<n.length;t++)r+=oa[n[t]%oa.length],t%4===3&&t<n.length-1&&(r+="-");return r}const da=40;function Gl({onConfirm:n,onCancel:r}){const[t,s]=o.useState(""),[a,i]=o.useState(ia()),[l,d]=o.useState("read-only"),[u,g]=o.useState("…"),[h,c]=o.useState(null),[b,x]=o.useState(!1),[m,k]=o.useState(null),[w,E]=o.useState(null),[j,v]=o.useState(""),f=o.useRef(null);o.useEffect(()=>{let H=!1;return r0.getDisplayName().then(J=>{H||s(J&&J.trim()?J:Ln())}).catch(()=>{H||s(Ln())}),r0.getLanAddress().then(J=>{!H&&J&&g(J)}).catch(()=>{H||g("unavailable")}),()=>{H=!0}},[]),o.useEffect(()=>{const H=setTimeout(()=>{f.current?.focus(),f.current?.select()},10);return()=>clearTimeout(H)},[]);async function I(H,J){try{await navigator.clipboard.writeText(H),c(J),setTimeout(()=>c(C=>C===J?null:C),1500)}catch{}}const p=t.trim(),A=p.length>0&&p.length<=da&&a.trim().length>0;async function F(H){if(H.preventDefault(),!(!A||b)){x(!0),k(null);try{await r0.setDisplayName(p)}catch{}try{const{fingerprint:J}=await r0.startHostSession(a.trim(),l);v(J),E(`${u}#${J}`)}catch(J){k(`${J}`),x(!1)}}}function Z(){n({name:p,token:a.trim(),role:l,fingerprint:j})}return w?e.jsxs(Nn,{title:"Session started",size:"sm",onClose:Z,children:[e.jsxs("div",{className:"modal-body",children:[e.jsx("p",{className:"form-hint",style:{marginTop:0},children:"Hosting over TLS. Send a guest the address and token below — they need both to join, and the address carries the certificate fingerprint that secures the connection."}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Address to share"}),e.jsxs("div",{className:"field-row",children:[e.jsx("input",{className:"input--mono",value:w,readOnly:!0,spellCheck:!1}),e.jsx("button",{type:"button",className:"icon-btn",title:h==="address"?"Copied!":"Copy address",onClick:()=>I(w,"address"),children:h==="address"?e.jsx(Qe,{size:14}):e.jsx(jn,{size:14})})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Join token"}),e.jsxs("div",{className:"field-row",children:[e.jsx("input",{className:"input--mono",value:a,readOnly:!0,spellCheck:!1}),e.jsx("button",{type:"button",className:"icon-btn",title:h==="token"?"Copied!":"Copy token",onClick:()=>I(a,"token"),children:h==="token"?e.jsx(Qe,{size:14}):e.jsx(jn,{size:14})})]})]})]}),e.jsx("div",{className:"modal-footer",children:e.jsx("button",{type:"button",className:"btn btn--primary btn--sm",onClick:Z,children:"Done"})})]}):e.jsx(Nn,{title:"Host a session",size:"sm",onClose:r,children:e.jsxs("form",{onSubmit:F,children:[e.jsxs("div",{className:"modal-body",children:[m&&e.jsx("div",{className:"modal-error",children:m}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Display name"}),e.jsxs("div",{className:"field-row",children:[e.jsx("input",{ref:f,placeholder:"e.g. Alex",value:t,maxLength:da,onChange:H=>s(H.target.value),spellCheck:!1}),e.jsx("button",{type:"button",className:"icon-btn",title:"Suggest another name",onClick:()=>s(Ln()),children:e.jsx(ct,{size:14})})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Join token"}),e.jsxs("div",{className:"field-row",children:[e.jsx("input",{className:"input--mono",value:a,onChange:H=>i(H.target.value),spellCheck:!1}),e.jsx("button",{type:"button",className:"icon-btn",title:"Generate a new token",onClick:()=>i(ia()),children:e.jsx(ct,{size:14})})]}),e.jsx("p",{className:"form-hint",children:"You'll get a shareable address (with the security fingerprint) once you start."})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Access"}),e.jsxs("select",{value:l,onChange:H=>d(H.target.value),children:[e.jsx("option",{value:"read-only",children:"View only — guests watch live"}),e.jsx("option",{value:"editor",children:"Everyone can edit — guests can change the graph"})]}),e.jsx("p",{className:"form-hint",children:l==="editor"?"Guests can add, move, edit and delete. Their changes write straight to your project.":"Guests see your graph update live but cannot change it."})]})]}),e.jsxs("div",{className:"modal-footer",children:[e.jsx("button",{type:"button",className:"btn btn--ghost btn--sm",onClick:r,children:"Cancel"}),e.jsx("button",{type:"submit",className:"btn btn--primary btn--sm",disabled:!A||b,children:b?"Starting…":"Start hosting"})]})]})})}const la=40;function ql({onConfirm:n,onCancel:r}){const[t,s]=o.useState(""),[a,i]=o.useState(""),[l,d]=o.useState(""),u=o.useRef(null);o.useEffect(()=>{let m=!1;return r0.getDisplayName().then(k=>{m||d(k&&k.trim()?k:Ln())}).catch(()=>{m||d(Ln())}),()=>{m=!0}},[]),o.useEffect(()=>{const m=setTimeout(()=>u.current?.focus(),10);return()=>clearTimeout(m)},[]);const g=l.trim(),h=t.trim(),c=a.trim(),b=h.length>0&&c.length>0&&g.length>0&&g.length<=la;async function x(m){if(m.preventDefault(),!!b){try{await r0.setDisplayName(g)}catch{}n({address:h,token:c,name:g})}}return e.jsx(Nn,{title:"Join a session",size:"sm",onClose:r,children:e.jsxs("form",{onSubmit:x,children:[e.jsxs("div",{className:"modal-body",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Session address or code"}),e.jsx("input",{ref:u,placeholder:"e.g. 192.168.1.42:57400#a1b2…",value:t,onChange:m=>s(m.target.value),spellCheck:!1}),e.jsx("p",{className:"form-hint",children:"Paste the full address the host shared — it includes the security fingerprint after the “#”."})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Join token"}),e.jsx("input",{className:"input--mono",placeholder:"Code from the host, e.g. K7P2-9XQ4-MN3R",value:a,onChange:m=>i(m.target.value),spellCheck:!1})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Display name"}),e.jsxs("div",{className:"field-row",children:[e.jsx("input",{value:l,maxLength:la,onChange:m=>d(m.target.value),spellCheck:!1}),e.jsx("button",{type:"button",className:"icon-btn",title:"Suggest another name",onClick:()=>d(Ln()),children:e.jsx(ct,{size:14})})]})]})]}),e.jsxs("div",{className:"modal-footer",children:[e.jsx("button",{type:"button",className:"btn btn--ghost btn--sm",onClick:r,children:"Cancel"}),e.jsx("button",{type:"submit",className:"btn btn--primary btn--sm",disabled:!b,children:"Join"})]})]})})}function Kl({meLabel:n="You",onJumpTo:r}){const t=zr();return e.jsxs("span",{className:"presence-badges",children:[e.jsxs("span",{className:"presence-chip presence-chip--me",children:[e.jsx("span",{className:"presence-chip__dot",style:{background:"var(--text-muted)"}}),e.jsx("span",{className:"presence-chip__name",children:n})]}),t.map(s=>e.jsxs("button",{type:"button",className:"presence-chip presence-chip--peer",style:{borderColor:s.color},title:`Jump to ${s.name}`,onClick:()=>r?.(s.x,s.y),children:[e.jsx("span",{className:"presence-chip__dot",style:{background:s.color}}),e.jsx("span",{className:"presence-chip__name",children:s.name})]},s.id))]})}function Zl(){const n=zr(),r=o.useRef(new Map),t=o.useRef(!1),s=o.useRef(0),[a,i]=o.useState([]),l=o.useCallback(d=>{const u=++s.current;i(g=>[...g,{id:u,msg:d}]),setTimeout(()=>i(g=>g.filter(h=>h.id!==u)),3200)},[]);return o.useEffect(()=>{const d=new Map(n.map(u=>[u.id,u.name]));if(!t.current){t.current=!0,r.current=d;return}for(const[u,g]of d)r.current.has(u)||l(`${g} joined`);for(const[u,g]of r.current)d.has(u)||l(`${g} left`);r.current=d},[n,l]),a.length?e.jsx("div",{className:"presence-toasts",role:"status","aria-live":"polite",children:a.map(d=>e.jsx("div",{className:"presence-toast",children:d.msg},d.id))}):null}function Jl(n,r,t){const[s,a]=o.useState(null),[i,l]=o.useState("downstream"),[d,u]=o.useState(null);o.useEffect(()=>{if(!s){u(null);return}let x=!1;return r0.trace(s,i).then(m=>{x||u(m)}).catch(()=>{x||u(null)}),()=>{x=!0}},[s,i,r]);const g=o.useMemo(()=>new Set(d?d.nodes.map(x=>x.id):[]),[d]),h=o.useMemo(()=>new Set(d?.edgeIds??[]),[d]),c=o.useCallback((x,m)=>{l(m),a(x),t?.()},[t]),b=o.useCallback(()=>a(null),[]);return o.useEffect(()=>{s&&!n.some(x=>x.id===s)&&a(null)},[n,s]),{traceSeedId:s,traceDirection:i,trace:d,traceNodeIds:g,traceEdgeIds:h,handleTrace:c,clearTrace:b,setTraceDirection:l}}function Yl(n){o.useEffect(()=>{const{keyStateRef:r,rfSelectionRef:t,orderedSelectionRef:s,clipboardRef:a,viewportRef:i,bookmarksRef:l,saveBookmarksRef:d,setPanel:u,setSelectedNodeId:g,setSelectedEdgeId:h,setSelectedRegionId:c,setSearchFocusTrigger:b,setSelectAllTrigger:x,setSelectRegionTrigger:m,setZoomToSelectionTrigger:k,setFocusMode:w,setQuickConnectSourceId:E,clearTrace:j,buildClipboardPayload:v}=n;function f(){const p=document.activeElement?.tagName;return["INPUT","TEXTAREA","SELECT"].includes(p??"")}function I(p){const{selectedNodeId:A,selectedEdgeId:F,selectedRegionId:Z,nodes:H,edges:J,regions:C,openCreatePicker:z,handleDeleteMultiple:L,handleDeleteRegion:P,handlePaste:W}=r.current;if(r.current.readOnly){const _=p.key,a0=p.ctrlKey||p.metaKey;if(a0&&["z","y","Z","b","v","d"].includes(_)||!a0&&!p.altKey&&["n","r","w"].includes(_)||_==="Delete"||_==="Backspace"||_==="Tab"&&!a0&&!p.shiftKey){if(f())return;(_==="Delete"||_==="Backspace"||_==="Tab")&&p.preventDefault();return}}if(p.key==="Escape"){u({kind:"none"}),g(void 0),h(void 0),c(void 0),j();return}if((p.ctrlKey||p.metaKey)&&p.key==="f"){p.preventDefault(),b(_=>_+1);return}if((p.ctrlKey||p.metaKey)&&p.key==="n"){p.preventDefault(),r.current.openNewTab?.();return}if((p.ctrlKey||p.metaKey)&&p.key==="w"){p.preventDefault(),r.current.closeActiveTab?.();return}if((p.ctrlKey||p.metaKey)&&p.shiftKey&&(p.key==="S"||p.key==="s")){p.preventDefault(),r.current.openSaveAs?.();return}if((p.ctrlKey||p.metaKey)&&p.key==="s"){p.preventDefault(),r.current.triggerSave?.();return}if((p.ctrlKey||p.metaKey)&&p.key==="o"){p.preventDefault(),r.current.openProject?.();return}if((p.ctrlKey||p.metaKey)&&!p.shiftKey&&p.key==="z"){p.preventDefault(),r.current.undo?.();return}if((p.ctrlKey||p.metaKey)&&(p.key==="y"||p.shiftKey&&p.key==="z")){p.preventDefault(),r.current.redo?.();return}if((p.ctrlKey||p.metaKey)&&p.key==="a"){if(f())return;p.preventDefault();const{selectedRegionId:_}=r.current;_?m(a0=>a0+1):x(a0=>a0+1);return}if((p.ctrlKey||p.metaKey)&&p.shiftKey&&p.key==="F"){p.preventDefault(),k(_=>_+1);return}if(!f()){if((p.ctrlKey||p.metaKey)&&p.key==="b"){p.preventDefault();const _=i.current,a0=l.current,c0=`View ${a0.length+1}`,B={id:crypto.randomUUID(),name:c0,..._};d.current([...a0,B]);return}if(p.key==="\\"){p.preventDefault(),w(_=>!_);return}if(p.key==="n"&&!p.ctrlKey&&!p.metaKey&&!p.altKey){z?.();return}if(p.key==="r"&&!p.ctrlKey&&!p.metaKey&&!p.altKey){r.current.cycleRoutingMode?.();return}if(p.key==="/"&&!p.ctrlKey&&!p.metaKey&&!p.altKey){p.preventDefault(),r.current.openQuickFind?.();return}if(p.key==="w"&&!p.ctrlKey&&!p.metaKey&&!p.altKey){const _=t.current;(s.current.length>=2||_.nodeIds.length>=2)&&(p.preventDefault(),r.current.autoWire?.());return}if(p.key==="e"&&!p.ctrlKey&&!p.metaKey&&!p.altKey){p.preventDefault(),r.current.toggleExpand?.();return}if(p.key==="g"&&!p.ctrlKey&&!p.metaKey&&!p.altKey){const{selectedNodeId:_}=r.current,a0=t.current;(_||a0.nodeIds.length>0)&&(p.preventDefault(),k(B=>B+1));return}if(p.key==="Tab"&&!p.ctrlKey&&!p.metaKey&&!p.shiftKey){const{selectedNodeId:_}=r.current;_&&(p.preventDefault(),E(_));return}if(p.key==="Delete"||p.key==="Backspace"){const _=t.current,a0=_.nodeIds.length?_.nodeIds:[...A?[A]:[],...Z?[Z]:[]],c0=_.edgeIds.length?_.edgeIds:F?[F]:[],{nodeIds:B,regionIds:S}=bt({edges:J,regions:C},a0);(B.length||c0.length)&&L?.(B,c0);for(const E0 of S)P?.(E0);return}if((p.ctrlKey||p.metaKey)&&p.key==="c"){p.preventDefault();const _=v();_&&(a.current=_);return}if((p.ctrlKey||p.metaKey)&&p.key==="v"){p.preventDefault();const _=a.current;_&&(_.nodes.length||_.regions.length)&&W?.(_);return}if((p.ctrlKey||p.metaKey)&&p.key==="d"){p.preventDefault();const _=v();_&&W?.(_);return}}}return document.addEventListener("keydown",I),()=>document.removeEventListener("keydown",I)},[])}class Ql{async onCloseRequested(r){return()=>{}}async setTitle(r){}destroy(){}async close(){}async show(){}async setFocus(){}async unminimize(){}}const Xl=new Ql;function ca(){return Xl}function ec({tabs:n,switchTab:r,setTabSavePath:t,markTabClean:s}){const[a,i]=o.useState(null),[l,d]=o.useState(0),[u,g]=o.useState(!1),h=o.useRef(n);h.current=n;const c=o.useRef(!1);c.current=a!==null;const b=a?n.find(E=>E.id===a[l])??null:null;o.useEffect(()=>{let E;return ca().onCloseRequested(j=>{if(c.current)return;const v=h.current.filter(f=>f.dirty).map(f=>f.id);v.length!==0&&(j.preventDefault(),d(0),i(v))}).then(j=>{E=j}).catch(()=>{}),()=>{E?.()}},[]);function x(){if(!a)return;const E=l+1;E>=a.length?(i(null),ca().destroy()):d(E)}async function m(){if(!(!b||u)){g(!0);try{let E=b.savePath??null;if(!E){const j=(b.name||"My Graph").replace(/[\\/:*?"<>|]/g,"_").trim()||"My Graph",v=await Yn({title:"Save Graph",defaultPath:`${j}.glograph`,filters:[{name:"GloGraph",extensions:["glograph"]}]});if(!v)return;E=v.endsWith(".glograph")?v:`${v}.glograph`}await r(b.id),await r0.saveGraphToPath(E),await r0.recordRecentProject(b.name,E),await t(b.id,E),await s(b.id),x()}catch(E){console.error("Save before quit failed:",E)}finally{g(!1)}}}function k(){u||x()}function w(){u||i(null)}return{quitTab:b,quitQueue:a,quitIndex:l,quitBusy:u,handleQuitSave:m,handleQuitDiscard:k,handleQuitCancel:w}}const wr=40;function nc(n){const{graph:r,gapi:t,history:s,keyStateRef:a,rfSelectionRef:i,setPinnedNodeIds:l,setPinnedExpandIds:d,setLockedRegionIds:u,setMinimizedRegionIds:g,applyRegionLock:h,applyRegionMinimize:c,suppressRegionHistoryRef:b}=n,x=o.useRef(null);function m(w){const{nodes:E,edges:j,regions:v,selectedNodeId:f,selectedRegionId:I,pinnedNodeIds:p,pinnedExpandIds:A,lockedRegionIds:F,minimizedRegionIds:Z}=a.current,H=i.current,J=w??(H.nodeIds.length?H.nodeIds:[...f?[f]:[],...I?[I]:[]]),{nodeIds:C,regionIds:z}=bt({edges:j,regions:v},J),L=v.filter(_=>z.includes(_.id)),P=new Set;for(const _ of L){const a0=new Ce(_);E.forEach(c0=>{a0.contains(new Me(c0))&&P.add(c0.id)})}const W=new Set([...C,...P]);return!W.size&&!L.length?null:{nodes:E.filter(_=>W.has(_.id)),edges:j.filter(_=>W.has(_.sourceId)&&W.has(_.targetId)),regions:L,pinnedNodeIds:new Set([...W].filter(_=>p?.has(_))),pinnedExpandIds:new Set([...W].filter(_=>A?.has(_))),lockedRegionIds:new Set(z.filter(_=>F?.has(_))),minimizedRegionIds:new Set(z.filter(_=>Z?.has(_)))}}async function k(w){const E=new Map,j=await Promise.all(w.nodes.map(p=>r.addNode({title:p.title,description:p.description,eventDate:p.eventDate,x:p.x+wr,y:p.y+wr,color:p.color,confidence:p.confidence,impactMagnitude:p.impactMagnitude,tags:p.tags,kind:p.kind,paramValues:p.paramValues.map(A=>({paramDefId:A.paramDefId,value:A.value,isEnabled:A.isEnabled,showOnCard:A.showOnCard}))})));w.nodes.forEach((p,A)=>E.set(p.id,j[A].id));const v=await Promise.all(w.nodes.map(async(p,A)=>{const F=j[A].id,Z=await Promise.all(p.links.map(C=>r.addLink({nodeId:F,url:C.url,label:C.label}))),H=await Promise.all(p.media.map(C=>r.addMedia({nodeId:F,label:C.label,src:C.src,srcType:C.srcType,mediaType:C.mediaType,showOnCard:C.showOnCard})));let J=j[A];return(p.width!=null||p.height!=null)&&(J=await r.setNodeSize(F,p.width??null,p.height??null)),p.renderMarkdown===!1&&(await r.setNodeRenderMarkdown(F,!1),J={...J,renderMarkdown:!1}),{...J,links:Z,media:H}})),f=await Promise.all(w.edges.filter(p=>E.has(p.sourceId)&&E.has(p.targetId)).map(p=>r.addEdge({sourceId:E.get(p.sourceId),targetId:E.get(p.targetId),sourceHandle:p.sourceHandle,targetHandle:p.targetHandle,paramValues:p.paramValues.map(A=>({paramDefId:A.paramDefId,value:A.value,isEnabled:A.isEnabled}))}))),I=await Promise.all(w.regions.map(p=>r.addRegion({title:p.title,x:p.x+wr,y:p.y+wr,width:p.width,height:p.height,color:p.color})));w.nodes.forEach((p,A)=>{const F=j[A].id;w.pinnedNodeIds?.has(p.id)&&(l(Z=>{const H=new Set(Z);return H.add(F),H}),t.setNodePinned(F,!0).catch(()=>{})),w.pinnedExpandIds?.has(p.id)&&(d(Z=>{const H=new Set(Z);return H.add(F),H}),t.setNodeExpandPinned(F,!0).catch(()=>{}))}),b.current=!0,w.regions.forEach((p,A)=>{const F=I[A].id;w.lockedRegionIds?.has(p.id)&&h(F,!0),w.minimizedRegionIds?.has(p.id)&&c(F,!0)}),b.current=!1,s.push({undo:async()=>{I.length&&(u(p=>{const A=new Set(p);return I.forEach(F=>A.delete(F.id)),A}),g(p=>{const A=new Set(p);return I.forEach(F=>A.delete(F.id)),A})),await Promise.all(I.map(p=>r.deleteRegion(p.id))),await Promise.all(f.map(p=>r.deleteEdge(p.id))),await Promise.all(v.map(p=>r.deleteNode(p.id)))},redo:async()=>{await Promise.all(v.map(p=>r.restoreNode(p))),await Promise.all(f.map(p=>r.restoreEdge(p))),await Promise.all(I.map(p=>r.restoreRegion(p))),w.regions.forEach((p,A)=>{const F=I[A].id;w.lockedRegionIds?.has(p.id)&&h(F,!0),w.minimizedRegionIds?.has(p.id)&&c(F,!0)})}})}return{clipboardRef:x,buildClipboardPayload:m,handlePaste:k}}function rc({nodes:n,edges:r,activeParamDefs:t,projectName:s,setSaveToast:a}){const i=()=>(s??"graph").replace(/[\\/:*?"<>|]/g,"_").trim()||"graph";async function l(){const h=["id","title","description","eventDate","x","y","confidence","impactMagnitude",...t.map(j=>j.displayName)].join(","),c=n.map(j=>[j.id,`"${(j.title??"").replace(/"/g,'""')}"`,`"${(j.description??"").replace(/"/g,'""')}"`,j.eventDate??"",j.x,j.y,j.confidence??"",j.impactMagnitude??"",...t.map(v=>{const f=j.paramValues.find(I=>I.paramDefId===v.id);return f?.value?v.paramType==="select_color"||v.paramType==="select"?v.options.find(I=>I.valueSlug===f.value)?.label??f.value:f.value:""})].join(",")),b=[h,...c].join(`
`),x=r.map(j=>[j.id,j.sourceId,j.targetId].join(",")),m=[["id","sourceId","targetId"].join(","),...x].join(`
`),k=await Yn({defaultPath:`${i()}-nodes.csv`});if(!k)return;const w=k.endsWith(".csv")?k:`${k}.csv`,E=/-nodes\.csv$/i.test(w)?w.replace(/-nodes\.csv$/i,"-edges.csv"):w.replace(/\.csv$/i,"-edges.csv");try{await r0.writeTextFile(w,b),await r0.writeTextFile(E,m),a({msg:`Exported ${w.split(/[\\/]/).pop()} + ${E.split(/[\\/]/).pop()}`,ok:!0}),setTimeout(()=>a(null),2800)}catch(j){a({msg:`Export failed: ${j}`,ok:!1}),setTimeout(()=>a(null),4e3)}}async function d(){const h=document.querySelector(".graph-canvas");if(!h)return;const c=await Yn({defaultPath:`${i()}.png`});if(!c)return;const b=c.endsWith(".png")?c:`${c}.png`;a({msg:"Exporting…",ok:!0});try{const{toPng:x}=await Er(async()=>{const{toPng:j}=await import("./index-BeoRn2gJ.js");return{toPng:j}},[]),k=(await x(h,{filter:j=>{const v=j;return!v.classList?.contains("react-flow__controls")&&!v.classList?.contains("react-flow__minimap")&&!v.classList?.contains("canvas-context-menu")&&!v.classList?.contains("canvas-empty")},backgroundColor:"#171717"})).split(",")[1]??"",w=atob(k),E=new Array(w.length);for(let j=0;j<w.length;j++)E[j]=w.charCodeAt(j);await r0.writeBinaryFile(b,E),a({msg:`Exported ${b.split(/[\\/]/).pop()}`,ok:!0}),setTimeout(()=>a(null),2500)}catch(x){a({msg:`Export failed: ${x}`,ok:!1}),setTimeout(()=>a(null),4e3)}}function u(){const h=b=>b.replace(/"/g,"'"),c=["flowchart LR"];for(const b of n)c.push(`  ${b.id}["${h(me(b))}"]`);for(const b of r)c.push(`  ${b.sourceId} --> ${b.targetId}`);navigator.clipboard.writeText(c.join(`
`)),a({msg:"Mermaid diagram copied to clipboard",ok:!0}),setTimeout(()=>a(null),2500)}function g(){const h=b=>b.replace(/"/g,'\\"'),c=["digraph G {"];c.push("  rankdir=LR;"),c.push("  node [shape=box];");for(const b of n)c.push(`  "${b.id}" [label="${h(me(b))}"];`);for(const b of r)c.push(`  "${b.sourceId}" -> "${b.targetId}";`);c.push("}"),navigator.clipboard.writeText(c.join(`
`)),a({msg:"DOT graph copied to clipboard",ok:!0}),setTimeout(()=>a(null),2500)}return{handleExportCsv:l,handleExportPng:d,handleExportMermaid:u,handleExportDot:g}}function tc({currentSavePath:n,setCurrentSavePath:r,activeTab:t,markTabClean:s,setTabSavePath:a,renameTab:i,setSaveToast:l}){async function d(){const h=(t?.name??"My Graph").replace(/[\\/:*?"<>|]/g,"_").trim()||"My Graph",c=await Yn({defaultPath:`${h}.glograph`});if(!c)return;const b=c.endsWith(".glograph")?c:`${c}.glograph`;try{if(await r0.saveGraphToPath(b),r(b),t){const m=t.id,k=(b.split(/[\\/]/).pop()??b).replace(/\.glograph$/i,"");await s(m),await a(m,b),await i(m,k),r0.recordRecentProject(k,b)}const x=b.split(/[\\/]/).pop()??b;l({msg:`Saved: ${x}`,ok:!0}),setTimeout(()=>l(null),2500)}catch(x){l({msg:`Save failed: ${x}`,ok:!1}),setTimeout(()=>l(null),4e3)}}function u(){n?r0.saveGraphToPath(n).then(async h=>{t&&(await a(t.id,h),await s(t.id),r0.recordRecentProject(t.name,h));const c=h.split(/[\\/]/).pop()??h;l({msg:`Saved: ${c}`,ok:!0}),setTimeout(()=>l(null),2500)}).catch(h=>{l({msg:`Save failed: ${h}`,ok:!1}),setTimeout(()=>l(null),4e3)}):d()}async function g(){const h=await Qn({});if(typeof h=="string")try{await r0.openPathAsTab(h)}catch(c){console.error("Open project failed:",c),l({msg:`Failed to open project: ${c}`,ok:!1}),setTimeout(()=>l(null),4e3)}}return{openSaveDialog:d,triggerSave:u,handleOpenProject:g}}function ac({viewportRef:n,markDirty:r}){const[t,s]=o.useState([]),[a,i]=o.useState(null);o.useEffect(()=>{r0.getAppSetting("canvas_bookmarks").then(c=>{if(c)try{s(JSON.parse(c))}catch(b){console.warn("Failed to parse bookmarks",b)}})},[]);function l(c){s(c),r0.setAppSetting("canvas_bookmarks",JSON.stringify(c)),r()}function d(c){const b=n.current,x={id:crypto.randomUUID(),name:c,...b};l([...t,x])}function u(c){l(t.filter(b=>b.id!==c))}function g(c){i({x:c.x,y:c.y,zoom:c.zoom})}return{bookmarks:t,saveBookmarks:l,handleSaveBookmark:d,handleDeleteBookmark:u,handleRestoreBookmark:g,targetViewport:a,clearTargetViewport:()=>i(null)}}function at(n){return{id:n.id,title:n.title,x:n.x,y:n.y,width:n.width,height:n.height,color:n.color}}function sc({graph:n,history:r,readOnly:t,selectedNodeId:s,rfSelectionRef:a,setPanel:i,setSelectedNodeId:l,setSelectedEdgeId:d,setSelectedRegionId:u,setScrollToPos:g,setMinimizedRegionIds:h,setLockedRegionIds:c}){async function b(f,I,p){const A=n.regions.find(H=>H.id===f);if(!A||A.x===I&&A.y===p)return;const F=at(A),Z={...F,x:I,y:p};await n.updateRegion(Z),r.push({undo:async()=>{await n.updateRegion(F)},redo:async()=>{await n.updateRegion(Z)}})}async function x(f,I,p,A,F){const Z=n.regions.find(C=>C.id===f);if(!Z||Z.x===I&&Z.y===p&&Z.width===A&&Z.height===F)return;const H=at(Z),J={...H,x:I,y:p,width:A,height:F};await n.updateRegion(J),r.push({undo:async()=>{await n.updateRegion(H)},redo:async()=>{await n.updateRegion(J)}})}async function m(f){const I=n.regions.find(H=>H.id===f);if(!I)return;const p=n.regions.filter(H=>H.id!==f),A=p.length?Math.max(...p.map(H=>H.zOrder)):-1/0;if(I.zOrder>A)return;const F=I.zOrder,Z=(p.length?A:0)+1;await n.setRegionZOrder(f,Z),r.push({undo:async()=>{await n.setRegionZOrder(f,F)},redo:async()=>{await n.setRegionZOrder(f,Z)}})}async function k(f){const I=n.regions.find(H=>H.id===f);if(!I)return;const p=n.regions.filter(H=>H.id!==f),A=p.length?Math.min(...p.map(H=>H.zOrder)):1/0;if(I.zOrder<A)return;const F=I.zOrder,Z=(p.length?A:0)-1;await n.setRegionZOrder(f,Z),r.push({undo:async()=>{await n.setRegionZOrder(f,F)},redo:async()=>{await n.setRegionZOrder(f,Z)}})}async function w(f){if(!t)if("id"in f){const I=n.regions.find(Z=>Z.id===f.id),p=I??null,A=p?{...f,x:p.x,y:p.y,width:p.width,height:p.height}:f,F=await n.updateRegion(A);if(i({kind:"editRegion",region:F}),I){const Z=at(I);r.push({undo:async()=>{const H=await n.updateRegion(Z);i(J=>J.kind==="editRegion"&&J.region.id===H.id?{kind:"editRegion",region:H}:J)},redo:async()=>{const H=await n.updateRegion(A);i(J=>J.kind==="editRegion"&&J.region.id===H.id?{kind:"editRegion",region:H}:J)}})}}else{const I=await n.addRegion(f);i({kind:"editRegion",region:I}),u(I.id),g({x:I.x+I.width/2,y:I.y+I.height/2}),r.push({undo:async()=>{await n.deleteRegion(I.id),i({kind:"none"}),u(void 0)},redo:async()=>{await n.restoreRegion(I),i({kind:"editRegion",region:I}),u(I.id)}})}}async function E(f){if(t)return;const I=n.regions.find(p=>p.id===f);await n.deleteRegion(f),h(p=>{if(!p.has(f))return p;const A=new Set(p);return A.delete(f),A}),c(p=>{if(!p.has(f))return p;const A=new Set(p);return A.delete(f),A}),i({kind:"none"}),u(void 0),I&&r.push({undo:async()=>{await n.restoreRegion(I),i({kind:"editRegion",region:I}),u(I.id)},redo:()=>n.deleteRegion(f)})}async function j(){const f=a.current,I=f.nodeIds.length?f.nodeIds:s?[s]:[];if(!I.length)return;const p=n.nodes.filter(L=>I.includes(L.id));if(!p.length)return;const A=24,F=28,Z=Math.min(...p.map(L=>L.x))-A,H=Math.min(...p.map(L=>L.y))-A-F,J=Math.max(...p.map(L=>L.x+Xe))+A,C=Math.max(...p.map(L=>L.y+en))+A,z=await n.addRegion({title:"",x:Z,y:H,width:J-Z,height:C-H,color:null});i({kind:"editRegion",region:z}),u(z.id),l(void 0),d(void 0),r.push({undo:async()=>{await n.deleteRegion(z.id),i({kind:"none"}),u(void 0)},redo:async()=>{await n.restoreRegion(z),i({kind:"editRegion",region:z}),u(z.id)}})}async function v(f){const I=n.regions.find(W=>W.id===f);if(!I)return;const p=24,A=28,F=new Ce(I),Z=n.nodes.filter(W=>F.contains(new Me(W)));if(!Z.length)return;const H=Math.min(...Z.map(W=>W.x))-p,J=Math.min(...Z.map(W=>W.y))-p-A,C=Math.max(...Z.map(W=>W.x+Xe))+p,z=Math.max(...Z.map(W=>W.y+en))+p,L={id:I.id,title:I.title,x:I.x,y:I.y,width:I.width,height:I.height,color:I.color},P=await n.updateRegion({id:I.id,title:I.title,x:H,y:J,width:C-H,height:z-J,color:I.color});i(W=>W.kind==="editRegion"&&W.region.id===f?{kind:"editRegion",region:P}:W),r.push({undo:async()=>{const W=await n.updateRegion(L);i(_=>_.kind==="editRegion"&&_.region.id===f?{kind:"editRegion",region:W}:_)},redo:async()=>{const W=await n.updateRegion({id:I.id,title:I.title,x:H,y:J,width:C-H,height:z-J,color:I.color});i(_=>_.kind==="editRegion"&&_.region.id===f?{kind:"editRegion",region:W}:_)}})}return{handleRegionMove:b,handleRegionResize:x,handleRegionBringToFront:m,handleRegionSendToBack:k,handleSaveRegion:w,handleDeleteRegion:E,handleWrapSelectionInRegion:j,handleRegionAutoFit:v}}function oc({graph:n,history:r,readOnly:t,activeEdgeParamDefs:s,setPanel:a,setSelectedNodeId:i,setSelectedEdgeId:l,setSelectedRegionId:d}){async function u(k,w,E,j){if(t)return;const v=s.map(I=>({paramDefId:I.id,value:I.defaultValue??null,isEnabled:I.defaultValue!=null})),f=await n.addEdge({sourceId:k,targetId:w,sourceHandle:E??null,targetHandle:j??null,paramValues:v});a({kind:"editEdge",edge:f}),l(f.id),i(void 0),d(void 0),r.push({undo:()=>n.deleteEdge(f.id),redo:()=>n.restoreEdge(f)})}async function g(k){const w=n.edges.find(E=>E.id===k);await n.deleteEdge(k),a({kind:"none"}),l(void 0),r.push({undo:()=>n.restoreEdge(w),redo:()=>n.deleteEdge(k)})}async function h(k){const w=n.edges.find(E=>E.id===k);w&&(await n.reconnectEdge(k,w.targetId,w.sourceId,w.targetHandle,w.sourceHandle),a(E=>E.kind!=="editEdge"||E.edge.id!==k?E:{kind:"editEdge",edge:{...E.edge,sourceId:w.targetId,targetId:w.sourceId,sourceHandle:w.targetHandle??null,targetHandle:w.sourceHandle??null}}),r.push({undo:()=>n.reconnectEdge(k,w.sourceId,w.targetId,w.sourceHandle,w.targetHandle),redo:()=>n.reconnectEdge(k,w.targetId,w.sourceId,w.targetHandle,w.sourceHandle)}))}async function c(k,w,E,j,v){const f=n.edges.find(I=>I.id===k);await n.reconnectEdge(k,w,E,j,v),f&&r.push({undo:()=>n.reconnectEdge(k,f.sourceId,f.targetId,f.sourceHandle,f.targetHandle),redo:()=>n.reconnectEdge(k,w,E,j,v)})}async function b(k){if(t)return;const w=n.edges.find(j=>j.id===k.id),E=await n.updateEdge(k);if(a({kind:"editEdge",edge:E}),w){const j={id:w.id,paramValues:w.paramValues.map(v=>({paramDefId:v.paramDefId,value:v.value,isEnabled:v.isEnabled})),label:w.label,color:w.color??null};r.push({undo:async()=>{const v=await n.updateEdge(j);a(f=>f.kind==="editEdge"&&f.edge.id===v.id?{kind:"editEdge",edge:v}:f)},redo:async()=>{const v=await n.updateEdge(k);a(f=>f.kind==="editEdge"&&f.edge.id===v.id?{kind:"editEdge",edge:v}:f)}})}}async function x(k,w){const E=n.edges.find(f=>f.id===k);if(!E)return;const j={id:k,paramValues:E.paramValues.map(f=>({paramDefId:f.paramDefId,value:f.value,isEnabled:f.isEnabled})),label:w,color:E.color??null},v=E.label??null;await n.updateEdge(j),r.push({undo:async()=>{await n.updateEdge({...j,label:v})},redo:async()=>{await n.updateEdge(j)}})}async function m(k,w){const E=n.edges.find(j=>j.id===k)?.waypoints??null;await n.updateEdgeWaypoints(k,w),r.push({undo:async()=>{await n.updateEdgeWaypoints(k,E)},redo:async()=>{await n.updateEdgeWaypoints(k,w)}})}return{handleConnect:u,handleDeleteEdge:g,handleFlipEdge:h,handleEdgeReconnect:c,handleSaveEdge:b,handleEdgeLabelChange:x,handleEdgeWaypointsChange:m}}function ua(n){return{id:n.id,title:n.title,description:n.description,eventDate:n.eventDate,x:n.x,y:n.y,color:n.color,confidence:n.confidence,impactMagnitude:n.impactMagnitude,paramValues:n.paramValues.map(r=>({paramDefId:r.paramDefId,value:r.value,isEnabled:r.isEnabled,showOnCard:r.showOnCard})),tags:n.tags}}function ic({graph:n,history:r,readOnly:t,activeEdgeParamDefs:s,quickConnectSourceId:a,setQuickConnectSourceId:i,setPanel:l,setSelectedNodeId:d,setSelectedEdgeId:u,setSelectedRegionId:g,setScrollToPos:h}){async function c(C,z){const L=await n.addNode({title:"",x:z.x,y:z.y,paramValues:[],kind:C});l({kind:"editNode",node:L}),d(L.id),u(void 0),g(void 0),h({x:L.x,y:L.y}),r.push({undo:()=>n.deleteNode(L.id),redo:()=>n.restoreNode(L)})}function b(C,z){const L=n.nodes.find(a0=>a0.id===C);if(!L)return;const P=z.length?z:null;if((L.description??"")===(P??""))return;const W=ua(L),_=L.description??null;n.updateNode({...W,description:P}),r.push({undo:async()=>{await n.updateNode({...W,description:_})},redo:async()=>{await n.updateNode({...W,description:P})}})}function x(C){const z=n.nodes.find(P=>P.id===C);if(!z)return;const L=z.renderMarkdown===!1;n.setNodeRenderMarkdown(C,L),r.push({undo:async()=>{await n.setNodeRenderMarkdown(C,!L)},redo:async()=>{await n.setNodeRenderMarkdown(C,L)}})}function m(C){const z=n.nodes.find(P=>P.id===C);if(!z)return;const L=z.showThumbnail===!1;n.setNodeShowThumbnail(C,L),r.push({undo:async()=>{await n.setNodeShowThumbnail(C,!L)},redo:async()=>{await n.setNodeShowThumbnail(C,L)}})}function k(C,z,L,P,W){const _=n.nodes.find(c0=>c0.id===C);if(!_)return;const a0={x:_.x,y:_.y,w:_.width??null,h:_.height??null};n.setNodeSize(C,P,W),n.updatePositions([{id:C,x:z,y:L}]),r.push({undo:async()=>{await n.setNodeSize(C,a0.w,a0.h),await n.updatePositions([{id:C,x:a0.x,y:a0.y}])},redo:async()=>{await n.setNodeSize(C,P,W),await n.updatePositions([{id:C,x:z,y:L}])}})}async function w(C){if(t)throw new Error("View only — editing is disabled.");let z=await n.addMedia(C);return r.push({undo:async()=>{await n.removeMedia(z.id,C.nodeId)},redo:async()=>{z=await n.addMedia(C)}}),z}function E(C,z){if(t)return;const L=n.nodes.find(W=>W.id===z)?.media.find(W=>W.id===C);if(n.removeMedia(C,z),!L)return;let P=L;r.push({undo:async()=>{P=await n.addMedia({nodeId:z,label:P.label,src:P.src,srcType:P.srcType,mediaType:P.mediaType,showOnCard:P.showOnCard})},redo:async()=>{await n.removeMedia(P.id,z)}})}function j(C,z,L){if(t)return;n.reorderMedia(C,z,L);const P=L==="up"?"down":"up";r.push({undo:async()=>{await n.reorderMedia(C,z,P)},redo:async()=>{await n.reorderMedia(C,z,L)}})}async function v(C){if(t)return;let z=await n.addLink(C);r.push({undo:async()=>{await n.removeLink(z.id,C.nodeId)},redo:async()=>{z=await n.addLink(C)}})}function f(C,z){if(t)return;const L=n.nodes.find(W=>W.id===z)?.links.find(W=>W.id===C);if(n.removeLink(C,z),!L)return;let P=L;r.push({undo:async()=>{P=await n.addLink({nodeId:z,url:P.url,label:P.label??null})},redo:async()=>{await n.removeLink(P.id,z)}})}async function I(C){const z=n.nodes.find(a0=>a0.id===C);if(!z)return;const L=n.nodes.filter(a0=>a0.id!==C),P=L.length?Math.max(...L.map(a0=>a0.zOrder??0)):-1/0;if((z.zOrder??0)>P)return;const W=z.zOrder??0,_=(L.length?P:0)+1;await n.setNodeZOrder(C,_),r.push({undo:async()=>{await n.setNodeZOrder(C,W)},redo:async()=>{await n.setNodeZOrder(C,_)}})}async function p(C){const z=n.nodes.find(a0=>a0.id===C);if(!z)return;const L=n.nodes.filter(a0=>a0.id!==C),P=L.length?Math.min(...L.map(a0=>a0.zOrder??0)):1/0;if((z.zOrder??0)<P)return;const W=z.zOrder??0,_=(L.length?P:0)-1;await n.setNodeZOrder(C,_),r.push({undo:async()=>{await n.setNodeZOrder(C,W)},redo:async()=>{await n.setNodeZOrder(C,_)}})}async function A(C){if(!t)if("id"in C){const z=n.nodes.find(W=>W.id===C.id),L=await n.updateNode(C);l({kind:"editNode",node:L});const P=ua(z);r.push({undo:async()=>{const W=await n.updateNode(P);l(_=>_.kind==="editNode"&&_.node.id===W.id?{kind:"editNode",node:W}:_)},redo:async()=>{const W=await n.updateNode(C);l(_=>_.kind==="editNode"&&_.node.id===W.id?{kind:"editNode",node:W}:_)}})}else{const z=await n.addNode(C);l({kind:"editNode",node:z}),d(z.id),h({x:z.x,y:z.y}),r.push({undo:()=>n.deleteNode(z.id),redo:()=>n.restoreNode(z)})}}async function F(C){if(t)return;const z=n.nodes.find(P=>P.id===C),L=n.edges.filter(P=>P.sourceId===C||P.targetId===C);await n.deleteNode(C),l({kind:"none"}),d(void 0),r.push({undo:async()=>{await n.restoreNode(z),await Promise.all(L.map(P=>n.restoreEdge(P)))},redo:()=>n.deleteNode(C)})}async function Z(C,z){if(t)return;const L=new Set(C),P=z.filter(c0=>{const B=n.edges.find(S=>S.id===c0);return B&&!L.has(B.sourceId)&&!L.has(B.targetId)}),W=C.map(c0=>n.nodes.find(B=>B.id===c0)).filter(Boolean),_=P.map(c0=>n.edges.find(B=>B.id===c0)).filter(Boolean),a0=n.edges.filter(c0=>L.has(c0.sourceId)||L.has(c0.targetId));await Promise.all([...P.map(c0=>n.deleteEdge(c0)),...C.map(c0=>n.deleteNode(c0))]),l({kind:"none"}),d(void 0),u(void 0),r.push({undo:async()=>{await Promise.all(W.map(c0=>n.restoreNode(c0))),await Promise.all([..._,...a0].map(c0=>n.restoreEdge(c0)))},redo:async()=>{await Promise.all([...P.map(c0=>n.deleteEdge(c0)),...C.map(c0=>n.deleteNode(c0))])}})}async function H(C,z=[]){const L=C.map(B=>{const S=n.nodes.find(E0=>E0.id===B.id);return S?{id:S.id,x:S.x,y:S.y}:B}),P=n.nodes.filter(B=>!z.includes(B.id)),W=P.length?Math.max(...P.map(B=>B.zOrder??0)):0,_=n.nodes.filter(B=>z.includes(B.id)&&(B.zOrder??0)<=W).sort((B,S)=>(B.zOrder??0)-(S.zOrder??0)),a0=_.map(B=>({id:B.id,z:B.zOrder??0})),c0=_.map((B,S)=>({id:B.id,z:W+1+S}));await n.updatePositions(C);for(const{id:B,z:S}of c0)await n.setNodeZOrder(B,S);r.push({undo:async()=>{await n.updatePositions(L);for(const{id:B,z:S}of a0)await n.setNodeZOrder(B,S)},redo:async()=>{await n.updatePositions(C);for(const{id:B,z:S}of c0)await n.setNodeZOrder(B,S)}})}async function J(C){const z=n.nodes.find(W=>W.id===a);if(!z){i(null);return}i(null);const L=await n.addNode({title:C,description:null,eventDate:null,x:z.x+260,y:z.y,color:null,confidence:null,impactMagnitude:null,paramValues:[]}),P=await n.addEdge({sourceId:z.id,targetId:L.id,sourceHandle:null,targetHandle:null,paramValues:s.map(W=>({paramDefId:W.id,value:W.defaultValue??null,isEnabled:W.defaultValue!=null}))});l({kind:"editNode",node:L}),d(L.id),h({x:L.x,y:L.y}),r.push({undo:async()=>{await n.deleteEdge(P.id),await n.deleteNode(L.id),l({kind:"editNode",node:z}),d(z.id)},redo:async()=>{await n.restoreNode(L),await n.restoreEdge(P)}})}return{handleCreateItem:c,handleInlineNoteChange:b,handleToggleRenderMarkdown:x,handleToggleShowThumbnail:m,handleNodeResize:k,handleAddMedia:w,handleRemoveMedia:E,handleReorderMedia:j,handleAddLink:v,handleRemoveLink:f,handleNodeBringToFront:I,handleNodeSendToBack:p,handleSaveNode:A,handleDeleteNode:F,handleDeleteMultiple:Z,handleNodeMove:H,handleQuickConnect:J}}const pa=200,ma=80;async function dc(n,r,t="TB"){const{default:s}=await Er(async()=>{const{default:i}=await import("./dagre.esm-B0qT7O9o.js");return{default:i}},[]),a=new s.graphlib.Graph;return a.setDefaultEdgeLabel(()=>({})),a.setGraph({rankdir:t,nodesep:60,ranksep:100}),n.forEach(i=>a.setNode(i.id,{width:pa,height:ma})),r.forEach(i=>{a.hasNode(i.sourceId)&&a.hasNode(i.targetId)&&a.setEdge(i.sourceId,i.targetId)}),s.layout(a),n.map(i=>{const l=a.node(i.id);return l?{id:i.id,x:l.x-pa/2,y:l.y-ma/2}:{id:i.id,x:i.x,y:i.y}})}const fa=Xe/2,ha=en/2;function lc({graph:n,history:r,readOnly:t,activeEdgeParamDefs:s,orderedSelectionRef:a,rfSelectionRef:i,dragVectorRef:l,lockedRegionIds:d,setFitViewTrigger:u}){async function g(){if(t)return;const c=new Set(n.regions.map(m=>m.id));let b=a.current.filter(m=>!c.has(m)&&n.nodes.find(k=>k.id===m));if(b.length<2){const m=i.current.nodeIds.filter(w=>!c.has(w)),k=l.current;b=m.slice().sort((w,E)=>{const j=n.nodes.find(f=>f.id===w),v=n.nodes.find(f=>f.id===E);if(k&&(Math.abs(k.dx)>4||Math.abs(k.dy)>4)){const f=(j.x+fa)*k.dx+(j.y+ha)*k.dy,I=(v.x+fa)*k.dx+(v.y+ha)*k.dy;return f-I}return j.x!==v.x?j.x-v.x:j.y-v.y})}if(b.length<2)return;const x=[];for(let m=0;m<b.length-1;m++){const k=s.map(E=>({paramDefId:E.id,value:E.defaultValue??null,isEnabled:E.defaultValue!=null})),w=await n.addEdge({sourceId:b[m],targetId:b[m+1],sourceHandle:null,targetHandle:null,paramValues:k});x.push(w)}r.push({undo:async()=>{for(const m of x)await n.deleteEdge(m.id)},redo:async()=>{for(const m of x)await n.restoreEdge(m)}})}async function h(c){if(!n.nodes.length)return;const b=n.nodes.map(w=>({id:w.id,x:w.x,y:w.y})),x=await dc(n.nodes,n.edges,c),m=n.regions.filter(w=>d.has(w.id)),k=m.length?x.map(w=>{const E=n.nodes.find(v=>v.id===w.id);if(m.some(v=>Hn(E,v)))return{id:w.id,x:E.x,y:E.y};const j=m.find(v=>Hn({x:w.x,y:w.y},v));return j?{id:w.id,x:w.x,y:j.y+j.height+24}:w}):x;await n.updatePositions(k),u(w=>w+1),r.push({undo:async()=>{await n.updatePositions(b),u(w=>w+1)},redo:async()=>{await n.updatePositions(k),u(w=>w+1)}})}return{handleAutoWire:g,handleAutoLayout:h}}function yt({size:n=18,className:r}){return e.jsx("svg",{className:r,width:n,height:n,viewBox:"0 0 1024 1024",fill:"currentColor","aria-hidden":"true",children:e.jsxs("g",{transform:"translate(512 512) rotate(-45) scale(6) translate(-50 -50)",children:[e.jsx("rect",{x:"0",y:"0",width:"24",height:"100"}),e.jsx("rect",{x:"0",y:"0",width:"100",height:"24"}),e.jsx("rect",{x:"0",y:"76",width:"100",height:"24"}),e.jsx("rect",{x:"76",y:"52",width:"24",height:"48"}),e.jsx("rect",{x:"52",y:"52",width:"48",height:"24"})]})})}const cc={"00000000-0000-0000-0000-000000000001":"For macro traders and analysts tracking global events, regimes, and causal chains across asset classes.","00000000-0000-0000-0000-000000000002":"For systems thinkers and engineers modeling feedback loops, stocks, flows, and dynamic behavior.","00000000-0000-0000-0000-000000000003":"For researchers and knowledge workers organizing concepts, claims, evidence, and their relationships.","00000000-0000-0000-0000-000000000004":"For teams and individuals tracking tasks, features, bugs, and dependencies across a project."},kn=["#d68b2a","#c97a1a","#e8a830","#e8c86e","#00b0c8","#5588bb","#3388cc","#2d6a8a","#3d9e5f","#2d8050","#50aa70","#6dcc88","#c83030","#aa2020","#7766aa","#888888"],Tr=["text","number","boolean","select","select_color"],Vn={text:"Text",number:"Number",boolean:"Toggle",select:"Dropdown",select_color:"Color Select"};function uc({nodeCount:n,onClose:r,initialTab:t}){const{settings:s,refreshSettings:a,edgeRoutingMode:i,setEdgeRoutingMode:l,snapToGrid:d,setSnapToGrid:u,expandNodesByDefault:g,setExpandNodesByDefault:h}=Se(),[c,b]=o.useState(t??"presets"),[x,m]=o.useState(!1),[k,w]=o.useState(null),E=o.useRef(null);function j(f){b(f),w(null),E.current?.scrollTo({top:0})}async function v(f){m(!0),w(null);try{await f(),await a()}catch(I){w(I instanceof Error?I.message:String(I))}finally{m(!1)}}return s?e.jsxs(Nn,{title:"Graph Settings",onClose:r,children:[e.jsx("div",{className:"modal-tabs",children:["presets","fields","edge_fields","display","api","shortcuts"].map(f=>e.jsx("button",{className:`modal-tab ${c===f?"modal-tab--active":""}`,onClick:()=>j(f),children:f==="presets"?"Presets":f==="fields"?"Node Fields":f==="edge_fields"?"Edge Fields":f==="display"?"Display":f==="api"?"API":"Shortcuts"},f))}),k&&e.jsx("div",{className:"modal-error",children:k}),e.jsxs("div",{className:"modal-body",ref:E,children:[c==="presets"&&e.jsx(pc,{settings:s,busy:x,run:v,nodeCount:n}),c==="fields"&&e.jsx(mc,{settings:s,busy:x,run:v,nodeCount:n}),c==="edge_fields"&&e.jsx(hc,{settings:s,busy:x,run:v,nodeCount:n}),c==="display"&&e.jsx(xc,{edgeRoutingMode:i,setEdgeRoutingMode:l,snapToGrid:d,setSnapToGrid:u,expandNodesByDefault:g,setExpandNodesByDefault:h}),c==="api"&&e.jsx(vc,{}),c==="shortcuts"&&e.jsx(wc,{})]})]}):null}function pc({settings:n,busy:r,run:t,nodeCount:s}){const[a,i]=o.useState(""),[l,d]=o.useState(null),[u,g]=o.useState(""),[h,c]=o.useState(null),[b,x]=o.useState(""),[m,k]=o.useState(null);async function w(){const f=a.trim();f&&(await t(async()=>{await r0.createPreset({name:f})}),i(""))}function E(f){d(f),g(f.name),c(null),k(null)}function j(f){c(f),x(`${f.name} (copy)`),d(null),k(null)}async function v(f){const I=u.trim();I&&(await t(()=>r0.renamePreset({id:f.id,name:I})),d(null))}return e.jsxs("div",{className:"settings-section",children:[e.jsx("p",{className:"settings-hint",children:"Presets group the fields available on nodes and edges. Switch presets to change which fields appear in panels and filters."}),s>0&&e.jsx("p",{className:"settings-preset-locked-notice",children:"Presets can only be switched on an empty graph. Start a new graph to change the preset."}),e.jsx("div",{className:"settings-list",children:n.presets.map(f=>{const I=f.id===n.activePresetId,p=cc[f.id];return e.jsx("div",{className:`settings-row ${I?"settings-row--active":""} ${f.isBuiltin?"settings-row--builtin":""}`,children:l?.id===f.id?e.jsxs("div",{className:"settings-row__inline-edit",children:[e.jsx("input",{autoFocus:!0,value:u,onChange:A=>g(A.target.value),onKeyDown:A=>{A.key==="Enter"&&u.trim()&&v(f),A.key==="Escape"&&d(null)}}),e.jsx("button",{className:"icon-btn icon-btn--confirm",disabled:r||!u.trim(),onClick:()=>v(f),children:e.jsx(Qe,{size:13})}),e.jsx("button",{className:"icon-btn",onClick:()=>d(null),children:e.jsx(S0,{size:13})})]}):h?.id===f.id?e.jsxs("div",{className:"settings-row__inline-edit",children:[e.jsx("input",{autoFocus:!0,value:b,placeholder:"Name for duplicate…",onChange:A=>x(A.target.value),onKeyDown:A=>{A.key==="Enter"&&b.trim()&&t(()=>r0.duplicatePreset({id:f.id,newName:b.trim()})).then(()=>c(null)),A.key==="Escape"&&c(null)}}),e.jsx("button",{className:"icon-btn icon-btn--confirm",disabled:r||!b.trim(),onClick:()=>t(()=>r0.duplicatePreset({id:f.id,newName:b.trim()})).then(()=>c(null)),children:e.jsx(Qe,{size:13})}),e.jsx("button",{className:"icon-btn",onClick:()=>c(null),children:e.jsx(S0,{size:13})})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"settings-row__label-group",children:[e.jsxs("span",{className:"settings-row__label",children:[f.name,I&&e.jsx("span",{className:"settings-badge settings-badge--active",children:"Active"})]}),f.isBuiltin&&p&&e.jsx("span",{className:"settings-row__desc",children:p})]}),e.jsxs("div",{className:"settings-row__actions",children:[!I&&e.jsx("button",{className:"btn btn--xs btn--ghost",disabled:r||s>0,title:s>0?"Presets can only be switched on an empty graph":void 0,onClick:()=>t(()=>r0.setActivePreset(f.id)),children:"Activate"}),e.jsx("button",{className:"icon-btn",title:"Rename",disabled:r,onClick:()=>E(f),children:e.jsx(_n,{size:13})}),e.jsx("button",{className:"icon-btn",title:"Duplicate",disabled:r,onClick:()=>j(f),children:e.jsx(jn,{size:13})}),!I&&!f.isBuiltin&&(m===f.id?e.jsxs("span",{className:"settings-row__delete-confirm",children:[e.jsx("button",{className:"btn btn--xs btn--danger",onClick:()=>{t(()=>r0.deletePreset(f.id)),k(null)},children:"Delete"}),e.jsx("button",{className:"icon-btn",onClick:()=>k(null),children:e.jsx(S0,{size:12})})]}):e.jsx("button",{className:"icon-btn icon-btn--danger",title:"Delete",disabled:r,onClick:()=>k(f.id),children:e.jsx(Ve,{size:13})}))]})]})},f.id)})}),e.jsxs("div",{className:"settings-template-row",children:[e.jsx("input",{className:"settings-template-name",value:a,onChange:f=>i(f.target.value),placeholder:"New preset name…",onKeyDown:f=>{f.key==="Enter"&&a.trim()&&w()}}),e.jsxs("button",{className:"btn btn--ghost btn--sm",disabled:r||!a.trim(),onClick:w,children:[e.jsx(oe,{size:13})," Add Preset"]})]})]})}function mc({settings:n,busy:r,run:t,nodeCount:s}){const[a,i]=o.useState(""),[l,d]=o.useState("text"),[u,g]=o.useState(""),[h,c]=o.useState(!1),[b,x]=o.useState(!1),[m,k]=o.useState(null),[w,E]=o.useState(null),[j,v]=o.useState(""),[f,I]=o.useState(""),[p,A]=o.useState(""),[F,Z]=o.useState(!1),[H,J]=o.useState(null),z=n.presets.find(_=>_.id===n.activePresetId)?.isBuiltin??!1;function L(_){E(_),v(_.displayName),I(_.paramType),A(_.defaultValue??""),Z(_.showOnCardDefault),J(null)}async function P(){if(!a.trim())return;const _=n.activePresetId;await t(()=>r0.createNodeParamDef({presetId:_,displayName:a.trim(),paramType:l,defaultValue:u||null,drivesColor:h,showOnCardDefault:b})),i(""),d("text"),g(""),c(!1),x(!1)}async function W(_){await t(()=>r0.updateNodeParamDef({id:_.id,displayName:j.trim(),paramType:f,defaultValue:p||null,showOnCardDefault:F})),E(null)}return e.jsxs("div",{className:"settings-section",children:[e.jsxs("div",{className:"settings-preset-selector",children:[e.jsx("span",{className:"settings-preset-selector__label",children:"Preset"}),e.jsx("select",{className:"settings-preset-selector__select",value:n.activePresetId,onChange:_=>t(()=>r0.setActivePreset(_.target.value)),disabled:r,children:n.presets.map(_=>e.jsx("option",{value:_.id,children:_.name},_.id))})]}),s>0&&e.jsx("p",{className:"settings-preset-locked-notice",children:"Switching presets on a graph with data will not migrate existing param values. Use the Presets tab to manage presets."}),e.jsxs("p",{className:"settings-hint",children:["Fields are optional properties available on every node. ",e.jsx("strong",{style:{color:"var(--text)"},children:"select_color"})," fields have named options with colours. Mark one as ",e.jsx("span",{style:{color:"var(--accent)"},children:"Node Color"})," to drive the card stripe and sidebar filters."]}),e.jsxs("div",{className:"settings-list",children:[n.paramDefs.length===0&&e.jsx("p",{className:"settings-empty",children:"No fields yet"}),n.paramDefs.map(_=>{const a0=m===_.id,c0=w?.id===_.id,B=_.paramType==="select_color"||_.paramType==="select";return e.jsxs("div",{className:"settings-param-block",children:[c0?e.jsxs("div",{className:"settings-param-edit",children:[e.jsx("input",{autoFocus:!0,value:j,onChange:S=>v(S.target.value),placeholder:"Display name",onKeyDown:S=>{S.key==="Escape"&&E(null)}}),e.jsx("select",{value:f,onChange:S=>I(S.target.value),children:Tr.map(S=>e.jsx("option",{value:S,children:Vn[S]??S},S))}),(f==="text"||f==="number")&&e.jsx("input",{value:p,onChange:S=>A(S.target.value),placeholder:"Default value (optional)"}),e.jsxs("label",{className:"checkbox-label",children:[e.jsx("input",{type:"checkbox",checked:F,onChange:S=>Z(S.target.checked)}),"Show on card by default"]}),e.jsxs("div",{className:"settings-param-edit__actions",children:[e.jsxs("button",{className:"btn btn--ghost btn--sm",disabled:r||!j.trim(),onClick:()=>W(_),children:[e.jsx(Qe,{size:13})," Save"]}),e.jsxs("button",{className:"btn btn--ghost btn--sm",onClick:()=>E(null),children:[e.jsx(S0,{size:13})," Cancel"]})]})]}):e.jsxs("div",{className:"settings-row",children:[e.jsxs("div",{className:"settings-row__left",children:[e.jsx("span",{className:"settings-row__label",children:_.displayName}),e.jsx("span",{className:"param-type-badge",children:Vn[_.paramType]??_.paramType}),_.drivesColor&&e.jsxs("span",{className:"param-type-badge param-type-badge--color",title:"Drives node color",children:[e.jsx(Ut,{size:9})," color"]}),_.showOnCardDefault&&e.jsx("span",{className:"param-type-badge param-type-badge--card",title:"Shown on card by default",children:"on card"}),_.defaultValue&&e.jsxs("span",{className:"settings-row__hint",children:["default: ",_.defaultValue]}),B&&_.options.length>0&&e.jsxs("span",{className:"settings-row__hint",children:[_.options.length," options"]})]}),e.jsxs("div",{className:"settings-row__actions",children:[_.paramType==="select_color"&&e.jsx("button",{className:`icon-btn ${_.drivesColor?"icon-btn--accent":""}`,title:_.drivesColor?"Currently drives node color":"Set as node color driver",disabled:r||_.drivesColor,onClick:()=>t(()=>r0.setDrivesColor(_.id)),children:e.jsx(Ut,{size:13})}),B&&e.jsx("button",{className:"btn btn--xs btn--ghost",onClick:()=>k(S=>S===_.id?null:_.id),children:a0?"Hide":"Options"}),e.jsx("button",{className:"icon-btn",title:"Edit",disabled:r,onClick:()=>L(_),children:e.jsx(_n,{size:13})}),H===_.id?e.jsxs("span",{className:"settings-row__delete-confirm",children:[e.jsx("button",{className:"btn btn--xs btn--danger",onClick:()=>{t(()=>r0.deleteNodeParamDef(_.id)),J(null)},children:"Delete"}),e.jsx("button",{className:"icon-btn",onClick:()=>J(null),children:e.jsx(S0,{size:12})})]}):e.jsx("button",{className:"icon-btn icon-btn--danger",title:"Delete",disabled:r,onClick:()=>J(_.id),children:e.jsx(Ve,{size:13})})]})]}),a0&&!c0&&e.jsx(fc,{def:_,busy:r,run:t,isBuiltin:z})]},_.id)})]}),e.jsxs("div",{className:"settings-param-add",children:[e.jsx("input",{value:a,onChange:_=>i(_.target.value),placeholder:"Field name…",onKeyDown:_=>{_.key==="Enter"&&a.trim()&&P()}}),e.jsx("select",{value:l,onChange:_=>{d(_.target.value),_.target.value!=="select_color"&&c(!1)},children:Tr.map(_=>e.jsx("option",{value:_,children:Vn[_]??_},_))}),(l==="text"||l==="number")&&e.jsx("input",{value:u,onChange:_=>g(_.target.value),placeholder:"Default value (optional)"}),e.jsxs("div",{className:"settings-drive-flags",children:[l==="select_color"&&e.jsxs("label",{className:"checkbox-label",children:[e.jsx("input",{type:"checkbox",checked:h,onChange:_=>c(_.target.checked)}),"Drives node color"]}),e.jsxs("label",{className:"checkbox-label",children:[e.jsx("input",{type:"checkbox",checked:b,onChange:_=>x(_.target.checked)}),"Show on card by default"]})]}),e.jsxs("button",{className:"btn btn--ghost btn--sm",disabled:r||!a.trim(),onClick:P,children:[e.jsx(oe,{size:13})," Add Field"]})]})]})}function fc({def:n,busy:r,run:t,isBuiltin:s}){const a=n.paramType==="select_color",[i,l]=o.useState(""),[d,u]=o.useState(kn[0]),[g,h]=o.useState(null),[c,b]=o.useState(""),[x,m]=o.useState(""),[k,w]=o.useState(null);function E(f){h(f),b(f.label),m(f.color??kn[0])}async function j(){i.trim()&&(await t(()=>r0.createParamOption({paramDefId:n.id,label:i.trim(),color:a?d:null})),l(""),u(kn[0]))}async function v(f){await t(()=>r0.updateParamOption({id:f.id,label:c.trim(),color:a?x:null})),h(null)}return e.jsxs("div",{className:"settings-sub-list",children:[n.options.length===0&&e.jsx("p",{className:"settings-empty",style:{margin:"8px 0 8px 12px"},children:"No options yet"}),n.options.map(f=>e.jsx("div",{className:"settings-sub-row",children:g?.id===f.id?e.jsxs("div",{className:"settings-row__inline-edit settings-row__inline-edit--full",children:[e.jsx("input",{autoFocus:!0,value:c,onChange:I=>b(I.target.value),onKeyDown:I=>{I.key==="Enter"&&c.trim()&&v(f),I.key==="Escape"&&h(null)}}),a&&e.jsx(Mr,{value:x,onChange:m}),e.jsx("button",{className:"icon-btn icon-btn--confirm",disabled:r||!c.trim(),onClick:()=>v(f),children:e.jsx(Qe,{size:13})}),e.jsx("button",{className:"icon-btn",onClick:()=>h(null),children:e.jsx(S0,{size:13})})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"settings-row__left",children:[a&&f.color&&e.jsx("span",{className:"settings-row__color-dot",style:{background:f.color}}),e.jsx("span",{className:"settings-sub-row__label",children:f.label}),e.jsx("span",{className:"settings-row__hint",style:{fontFamily:"monospace"},children:f.valueSlug})]}),!s&&e.jsxs("div",{className:"settings-row__actions",children:[e.jsx("button",{className:"icon-btn",disabled:r,onClick:()=>E(f),children:e.jsx(_n,{size:13})}),k===f.id?e.jsxs("span",{className:"settings-row__delete-confirm",children:[e.jsx("button",{className:"btn btn--xs btn--danger",onClick:()=>{t(()=>r0.deleteParamOption(f.id)),w(null)},children:"Delete"}),e.jsx("button",{className:"icon-btn",onClick:()=>w(null),children:e.jsx(S0,{size:12})})]}):e.jsx("button",{className:"icon-btn icon-btn--danger",disabled:r,onClick:()=>w(f.id),children:e.jsx(Ve,{size:13})})]})]})},f.id)),!s&&e.jsxs("div",{className:`settings-add-row settings-add-row--inline ${a?"settings-add-row--with-color":""}`,children:[e.jsx("input",{value:i,onChange:f=>l(f.target.value),placeholder:"New option…",onKeyDown:f=>{f.key==="Enter"&&j()}}),a&&e.jsx(Mr,{value:d,onChange:u}),e.jsxs("button",{className:"btn btn--ghost btn--xs",disabled:r||!i.trim(),onClick:j,children:[e.jsx(oe,{size:12})," Add"]})]})]})}function hc({settings:n,busy:r,run:t,nodeCount:s}){const[a,i]=o.useState(""),[l,d]=o.useState("text"),[u,g]=o.useState(""),[h,c]=o.useState(!1),[b,x]=o.useState(!1),[m,k]=o.useState(!1),[w,E]=o.useState(!1),[j,v]=o.useState(null),[f,I]=o.useState(null),[p,A]=o.useState(""),[F,Z]=o.useState(""),[H,J]=o.useState(""),[C,z]=o.useState(null),L=S=>S==="select"||S==="select_color",W=n.presets.find(S=>S.id===n.activePresetId)?.isBuiltin??!1;function _(S){S!=="boolean"&&c(!1),S!=="select"&&x(!1),S!=="select_color"&&k(!1),S!=="number"&&E(!1)}function a0(S){I(S),A(S.displayName),Z(S.paramType),J(S.defaultValue??""),z(null)}async function c0(){a.trim()&&(await t(async()=>{const S=n.activePresetId;await r0.createEdgeParamDef({presetId:S,displayName:a.trim(),paramType:l,defaultValue:u||null,drivesArrow:h,drivesStyle:b,drivesColor:m,drivesWidth:w})}),i(""),d("text"),g(""),c(!1),x(!1),k(!1),E(!1))}async function B(S){await t(async()=>{await r0.updateEdgeParamDef({id:S.id,displayName:p.trim(),paramType:F,defaultValue:H||null})}),I(null)}return e.jsxs("div",{className:"settings-section",children:[e.jsxs("div",{className:"settings-preset-selector",children:[e.jsx("span",{className:"settings-preset-selector__label",children:"Preset"}),e.jsx("select",{className:"settings-preset-selector__select",value:n.activePresetId,onChange:S=>t(()=>r0.setActivePreset(S.target.value)),disabled:r,children:n.presets.map(S=>e.jsx("option",{value:S.id,children:S.name},S.id))})]}),s>0&&e.jsx("p",{className:"settings-preset-locked-notice",children:"Switching presets on a graph with data will not migrate existing param values. Use the Presets tab to manage presets."}),e.jsxs("p",{className:"settings-hint",children:["Edge fields are custom properties on connections. Use drive flags to control visual rendering:",e.jsx("strong",{style:{color:"var(--text)"},children:" arrow"})," (boolean),",e.jsx("strong",{style:{color:"var(--text)"},children:" style"})," (select),",e.jsx("strong",{style:{color:"var(--text)"},children:" color"})," (select_color),",e.jsx("strong",{style:{color:"var(--text)"},children:" width"})," (number)."]}),e.jsxs("div",{className:"settings-list",children:[n.edgeParamDefs.length===0&&e.jsx("p",{className:"settings-empty",children:"No edge fields yet"}),n.edgeParamDefs.map(S=>{const E0=j===S.id,Y0=f?.id===S.id,A0=L(S.paramType);return e.jsxs("div",{className:"settings-param-block",children:[Y0?e.jsxs("div",{className:"settings-param-edit",children:[e.jsx("input",{autoFocus:!0,value:p,onChange:I0=>A(I0.target.value),placeholder:"Display name",onKeyDown:I0=>{I0.key==="Escape"&&I(null)}}),e.jsx("select",{value:F,onChange:I0=>Z(I0.target.value),children:Tr.map(I0=>e.jsx("option",{value:I0,children:Vn[I0]??I0},I0))}),(F==="text"||F==="number")&&e.jsx("input",{value:H,onChange:I0=>J(I0.target.value),placeholder:"Default value (optional)"}),e.jsxs("div",{className:"settings-param-edit__actions",children:[e.jsxs("button",{className:"btn btn--ghost btn--sm",disabled:r||!p.trim(),onClick:()=>B(S),children:[e.jsx(Qe,{size:13})," Save"]}),e.jsxs("button",{className:"btn btn--ghost btn--sm",onClick:()=>I(null),children:[e.jsx(S0,{size:13})," Cancel"]})]})]}):e.jsxs("div",{className:"settings-row",children:[e.jsxs("div",{className:"settings-row__left",children:[e.jsx("span",{className:"settings-row__label",children:S.displayName}),e.jsx("span",{className:"param-type-badge",children:Vn[S.paramType]??S.paramType}),S.drivesArrow&&e.jsxs("span",{className:"param-type-badge param-type-badge--drive",title:"Drives arrowhead",children:[e.jsx(Ir,{size:9})," arrow"]}),S.drivesStyle&&e.jsxs("span",{className:"param-type-badge param-type-badge--drive",title:"Drives line style",children:[e.jsx(Cr,{size:9})," style"]}),S.drivesColor&&e.jsxs("span",{className:"param-type-badge param-type-badge--color",title:"Drives edge color",children:[e.jsx(Gt,{size:9})," color"]}),S.drivesWidth&&e.jsxs("span",{className:"param-type-badge param-type-badge--drive",title:"Drives line width",children:[e.jsx(Kt,{size:9})," width"]}),S.defaultValue&&e.jsxs("span",{className:"settings-row__hint",children:["default: ",S.defaultValue]}),A0&&S.options.length>0&&e.jsxs("span",{className:"settings-row__hint",children:[S.options.length," options"]})]}),e.jsxs("div",{className:"settings-row__actions",children:[S.paramType==="boolean"&&!S.drivesArrow&&e.jsx("button",{className:"icon-btn",title:"Set as arrow driver",disabled:r,onClick:()=>t(()=>r0.setEdgeDrive(S.id,"arrow")),children:e.jsx(Ir,{size:13})}),S.paramType==="select"&&!S.drivesStyle&&e.jsx("button",{className:"icon-btn",title:"Set as style driver",disabled:r,onClick:()=>t(()=>r0.setEdgeDrive(S.id,"style")),children:e.jsx(Cr,{size:13})}),S.paramType==="select_color"&&!S.drivesColor&&e.jsx("button",{className:"icon-btn",title:"Set as color driver",disabled:r,onClick:()=>t(()=>r0.setEdgeDrive(S.id,"color")),children:e.jsx(Gt,{size:13})}),S.paramType==="number"&&!S.drivesWidth&&e.jsx("button",{className:"icon-btn",title:"Set as width driver",disabled:r,onClick:()=>t(()=>r0.setEdgeDrive(S.id,"width")),children:e.jsx(Kt,{size:13})}),A0&&e.jsx("button",{className:"btn btn--xs btn--ghost",onClick:()=>v(I0=>I0===S.id?null:S.id),children:E0?"Hide":"Options"}),e.jsx("button",{className:"icon-btn",title:"Edit",disabled:r,onClick:()=>a0(S),children:e.jsx(_n,{size:13})}),C===S.id?e.jsxs("span",{className:"settings-row__delete-confirm",children:[e.jsx("button",{className:"btn btn--xs btn--danger",onClick:()=>{t(()=>r0.deleteEdgeParamDef(S.id)),z(null)},children:"Delete"}),e.jsx("button",{className:"icon-btn",onClick:()=>z(null),children:e.jsx(S0,{size:12})})]}):e.jsx("button",{className:"icon-btn icon-btn--danger",title:"Delete",disabled:r,onClick:()=>z(S.id),children:e.jsx(Ve,{size:13})})]})]}),E0&&!Y0&&e.jsx(gc,{def:S,busy:r,run:t,isBuiltin:W})]},S.id)})]}),e.jsxs("div",{className:"settings-param-add",children:[e.jsx("input",{value:a,onChange:S=>i(S.target.value),placeholder:"Field name…",onKeyDown:S=>{S.key==="Enter"&&a.trim()&&c0()}}),e.jsx("select",{value:l,onChange:S=>{d(S.target.value),_(S.target.value)},children:Tr.map(S=>e.jsx("option",{value:S,children:Vn[S]??S},S))}),(l==="text"||l==="number")&&e.jsx("input",{value:u,onChange:S=>g(S.target.value),placeholder:"Default value (optional)"}),e.jsxs("div",{className:"settings-drive-flags",children:[l==="boolean"&&e.jsxs("label",{className:"checkbox-label",children:[e.jsx("input",{type:"checkbox",checked:h,onChange:S=>c(S.target.checked)}),"Drives arrow"]}),l==="select"&&e.jsxs("label",{className:"checkbox-label",children:[e.jsx("input",{type:"checkbox",checked:b,onChange:S=>x(S.target.checked)}),"Drives style"]}),l==="select_color"&&e.jsxs("label",{className:"checkbox-label",children:[e.jsx("input",{type:"checkbox",checked:m,onChange:S=>k(S.target.checked)}),"Drives color"]}),l==="number"&&e.jsxs("label",{className:"checkbox-label",children:[e.jsx("input",{type:"checkbox",checked:w,onChange:S=>E(S.target.checked)}),"Drives width"]})]}),e.jsxs("button",{className:"btn btn--ghost btn--sm",disabled:r||!a.trim(),onClick:c0,children:[e.jsx(oe,{size:13})," Add Field"]})]})]})}function gc({def:n,busy:r,run:t,isBuiltin:s}){const a=n.paramType==="select_color",[i,l]=o.useState(""),[d,u]=o.useState(kn[0]),[g,h]=o.useState(null),[c,b]=o.useState(""),[x,m]=o.useState(""),[k,w]=o.useState(null);function E(f){h(f),b(f.label),m(f.color??kn[0])}async function j(){i.trim()&&(await t(()=>r0.createEdgeParamOption({paramDefId:n.id,label:i.trim(),color:a?d:null})),l(""),u(kn[0]))}async function v(f){await t(()=>r0.updateEdgeParamOption({id:f.id,label:c.trim(),color:a?x:null})),h(null)}return e.jsxs("div",{className:"settings-sub-list",children:[n.options.length===0&&e.jsx("p",{className:"settings-empty",style:{margin:"8px 0 8px 12px"},children:"No options yet"}),n.options.map(f=>e.jsx("div",{className:"settings-sub-row",children:g?.id===f.id?e.jsxs("div",{className:"settings-row__inline-edit settings-row__inline-edit--full",children:[e.jsx("input",{autoFocus:!0,value:c,onChange:I=>b(I.target.value),onKeyDown:I=>{I.key==="Enter"&&c.trim()&&v(f),I.key==="Escape"&&h(null)}}),a&&e.jsx(Mr,{value:x,onChange:m}),e.jsx("button",{className:"icon-btn icon-btn--confirm",disabled:r||!c.trim(),onClick:()=>v(f),children:e.jsx(Qe,{size:13})}),e.jsx("button",{className:"icon-btn",onClick:()=>h(null),children:e.jsx(S0,{size:13})})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"settings-row__left",children:[a&&f.color&&e.jsx("span",{className:"settings-row__color-dot",style:{background:f.color}}),e.jsx("span",{className:"settings-sub-row__label",children:f.label}),e.jsx("span",{className:"settings-row__hint",style:{fontFamily:"monospace"},children:f.valueSlug})]}),!s&&e.jsxs("div",{className:"settings-row__actions",children:[e.jsx("button",{className:"icon-btn",disabled:r,onClick:()=>E(f),children:e.jsx(_n,{size:13})}),k===f.id?e.jsxs("span",{className:"settings-row__delete-confirm",children:[e.jsx("button",{className:"btn btn--xs btn--danger",onClick:()=>{t(()=>r0.deleteEdgeParamOption(f.id)),w(null)},children:"Delete"}),e.jsx("button",{className:"icon-btn",onClick:()=>w(null),children:e.jsx(S0,{size:12})})]}):e.jsx("button",{className:"icon-btn icon-btn--danger",disabled:r,onClick:()=>w(f.id),children:e.jsx(Ve,{size:13})})]})]})},f.id)),!s&&e.jsxs("div",{className:`settings-add-row settings-add-row--inline ${a?"settings-add-row--with-color":""}`,children:[e.jsx("input",{value:i,onChange:f=>l(f.target.value),placeholder:"New option…",onKeyDown:f=>{f.key==="Enter"&&j()}}),a&&e.jsx(Mr,{value:d,onChange:u}),e.jsxs("button",{className:"btn btn--ghost btn--xs",disabled:r||!i.trim(),onClick:j,children:[e.jsx(oe,{size:12})," Add"]})]})]})}const bc=[{mode:"bezier",label:"Bezier",description:"Smooth curved edges with a single draggable control point."},{mode:"waypoints",label:"Waypoints",description:"Straight segments with draggable intermediate points. Click a selected edge to add a point; double-click a point to remove it."},{mode:"orthogonal",label:"Orthogonal",description:"Right-angle routing. Drag the central handle to shift the bend left or right."}];function xc({edgeRoutingMode:n,setEdgeRoutingMode:r,snapToGrid:t,setSnapToGrid:s,expandNodesByDefault:a,setExpandNodesByDefault:i}){return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"settings-section",children:[e.jsx("h3",{className:"settings-section-title",children:"Edge Routing"}),e.jsx("p",{className:"settings-section-desc",children:"Controls how edges are drawn between nodes. Select an edge and drag the handles to adjust its shape."}),e.jsx("div",{className:"routing-options",children:bc.map(({mode:l,label:d,description:u})=>e.jsxs("button",{className:`routing-option ${n===l?"routing-option--active":""}`,onClick:()=>r(l),children:[e.jsx("span",{className:"routing-option__label",children:d}),e.jsx("span",{className:"routing-option__desc",children:u})]},l))})]}),e.jsxs("div",{className:"settings-section",children:[e.jsx("h3",{className:"settings-section-title",children:"Canvas"}),e.jsxs("label",{className:"settings-toggle-row",children:[e.jsx("input",{type:"checkbox",checked:t,onChange:l=>s(l.target.checked)}),e.jsx("span",{className:"settings-toggle-label",children:"Snap to grid"}),e.jsx("span",{className:"settings-toggle-desc",children:"Nodes snap to a 24px grid while dragging."})]})]}),e.jsxs("div",{className:"settings-section",children:[e.jsx("h3",{className:"settings-section-title",children:"Nodes"}),e.jsxs("label",{className:"settings-toggle-row",children:[e.jsx("input",{type:"checkbox",checked:a,onChange:l=>i(l.target.checked)}),e.jsx("span",{className:"settings-toggle-label",children:"Expand nodes by default"}),e.jsx("span",{className:"settings-toggle-desc",children:"Show every node card's full details at rest. Off: cards stay compact and expand on hover."})]})]})]})}function vc(){return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"settings-section",children:[e.jsx("h3",{className:"settings-section-title",children:"HTTP API & SDK"}),e.jsx("p",{className:"settings-section-desc",children:"The local REST API and the Python SDK are part of the desktop app — they're not available in the web demo."}),e.jsx("p",{className:"settings-section-desc",children:"In the full app you can script your graphs, stream data in, and let AI agents read and build graphs over a local API."})]}),e.jsxs("div",{className:"settings-section",children:[e.jsx("h3",{className:"settings-section-title",children:"Live Share"}),e.jsx("p",{className:"settings-section-desc",children:"Hosting and joining shared sessions are coming to the desktop app, and aren't part of the web demo."})]})]})}const yc=[{group:"File",items:[{keys:["Ctrl","N"],desc:"New project"},{keys:["Ctrl","W"],desc:"Close current tab"},{keys:["Ctrl","O"],desc:"Open project"},{keys:["Ctrl","S"],desc:"Save (overwrites the linked file)"},{keys:["Ctrl","Shift","S"],desc:"Save As…"}]},{group:"Edit",items:[{keys:["Ctrl","Z"],desc:"Undo"},{keys:["Ctrl","Y"],desc:"Redo"},{keys:["Ctrl","C"],desc:"Copy selection"},{keys:["Ctrl","V"],desc:"Paste"},{keys:["Ctrl","D"],desc:"Duplicate selection"},{keys:["Ctrl","A"],desc:"Select all (or a selected region’s members)"},{keys:["Del"],desc:"Delete selection"}]},{group:"Create & connect",items:[{keys:["N"],desc:"Add a graph object (picker: Node / Note / Image / Video / Audio)"},{keys:["Tab"],desc:"Quick-connect a new node from the selected one"},{keys:["W"],desc:"Auto-wire selected nodes in order"},{keys:["R"],desc:"Cycle edge routing (bezier → waypoints → orthogonal)"}]},{group:"View & navigation",items:[{keys:["E"],desc:"Expand / collapse all nodes (or only the selected nodes)"},{keys:["Ctrl","F"],desc:"Focus the sidebar search"},{keys:["/"],desc:"Quick-find nodes"},{keys:["G"],desc:"Zoom to selection (fit all if nothing selected)"},{keys:["Ctrl","Shift","F"],desc:"Zoom to selection"},{keys:["Ctrl","B"],desc:"Bookmark the current view"},{keys:["\\"],desc:"Toggle focus mode (hide side panels)"}]},{group:"General",items:[{keys:["Esc"],desc:"Close the open panel / dialog, or deselect all"}]}];function wc(){return e.jsxs(e.Fragment,{children:[e.jsxs("p",{className:"settings-hint",children:["Keyboard shortcuts available throughout the app. Modifier keys are ",e.jsx("code",{style:{fontFamily:"monospace"},children:"Ctrl"})," on Windows/Linux and ",e.jsx("code",{style:{fontFamily:"monospace"},children:"⌘"})," on macOS."]}),yc.map(n=>e.jsxs("div",{className:"settings-section",children:[e.jsx("h3",{className:"settings-section-title",children:n.group}),e.jsx("div",{className:"shortcut-list",children:n.items.map(r=>e.jsxs("div",{className:"shortcut-row",children:[e.jsx("span",{className:"shortcut-keys",children:r.keys.map(t=>e.jsx("kbd",{className:"shortcut-key",children:t},t))}),e.jsx("span",{className:"shortcut-desc",children:r.desc})]},r.desc))})]},n.group))]})}function Mr({value:n,onChange:r}){return e.jsx("div",{className:"inline-color-picker",children:kn.map(t=>e.jsx("button",{type:"button",className:`color-swatch color-swatch--sm ${n===t?"color-swatch--active":""}`,style:{background:t},onClick:()=>r(t),title:t},t))})}const ga=[{id:"00000000-0000-0000-0000-000000000005",name:"Blank",description:"No parameters — start from scratch",color:"#8b949e"},{id:"00000000-0000-0000-0000-000000000001",name:"Macro Economics",description:"Events, causation, and macro themes",color:"#d68b2a"},{id:"00000000-0000-0000-0000-000000000002",name:"System Behavior",description:"Stocks, flows, and feedback loops",color:"#3d9e5f"},{id:"00000000-0000-0000-0000-000000000003",name:"Knowledge Map",description:"Concepts, claims, and evidence",color:"#5588bb"},{id:"00000000-0000-0000-0000-000000000004",name:"Project Tracker",description:"Tasks, dependencies, and milestones",color:"#7766aa"}];function hs({onConfirm:n,onCancel:r}){const[t,s]=o.useState(""),[a,i]=o.useState(ga[0].id),l=o.useRef(null);o.useEffect(()=>{l.current?.focus()},[]);function d(u){u.preventDefault(),n(t.trim()||"Untitled Project",a)}return e.jsx(Nn,{title:"New Project",size:"sm",onClose:r,children:e.jsxs("form",{onSubmit:d,children:[e.jsxs("div",{className:"modal-body",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Project name"}),e.jsx("input",{ref:l,placeholder:"Untitled Project",value:t,onChange:u=>s(u.target.value)})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Preset"}),e.jsx("select",{value:a,onChange:u=>i(u.target.value),children:ga.map(u=>e.jsx("option",{value:u.id,children:u.name},u.id))})]})]}),e.jsxs("div",{className:"modal-footer",children:[e.jsx("button",{type:"button",className:"btn btn--ghost btn--sm",onClick:r,children:"Cancel"}),e.jsx("button",{type:"submit",className:"btn btn--primary btn--sm",children:"Create"})]})]})})}const gs=o.createContext(null);function kc({children:n}){const[r,t]=o.useState([]),[s,a]=o.useState(!0),[i,l]=o.useState(null);o.useEffect(()=>{r0.getTabs().then(j=>{t(j),a(!1)}).catch(()=>a(!1))},[]),o.useEffect(()=>{const j=$a("tabs:changed",v=>{t(v.payload)});return()=>{j.then(v=>v())}},[]);const d=r.find(j=>j.isActive)??null;async function u(j){await r0.switchTab(j)}async function g(j,v){await r0.createTab(j,v)}async function h(j,v=!1){await r0.closeTab(j,v)}async function c(j,v){await r0.renameTab(j,v)}async function b(j,v){await r0.setTabSavePath(j,v)}async function x(j){const v=await r0.setTabDirty(j,!0);t(v)}async function m(j){const v=await r0.setTabDirty(j,!1);t(v)}async function k(){const j=await r0.recomputeActiveTabDirty();t(j)}function w(j){l(j)}function E(){l(null)}return e.jsx(gs.Provider,{value:{tabs:r,activeTab:d,loading:s,switchTab:u,createTab:g,closeTab:h,renameTab:c,setTabSavePath:b,markTabDirty:x,markTabClean:m,recomputeActiveTabDirty:k,closeRequestId:i,requestCloseTab:w,clearCloseRequest:E},children:n})}function Ar(){const n=o.useContext(gs);if(!n)throw new Error("useTabs must be used within TabsProvider");return n}function jc({onNewTab:n}){const{tabs:r,switchTab:t,closeTab:s,renameTab:a,requestCloseTab:i}=Ar(),[l,d]=o.useState(null),[u,g]=o.useState(""),h=o.useRef(null);function c(w){w.isActive||t(w.id)}function b(w,E){if(w.stopPropagation(),!E.dirty){s(E.id,!E.savePath);return}E.isActive?i(E.id):t(E.id).then(()=>i(E.id))}function x(w,E){w.preventDefault(),d(E.id),g(E.name),setTimeout(()=>h.current?.select(),10)}function m(){if(!l)return;const w=u.trim();w&&w!==r.find(E=>E.id===l)?.name&&a(l,w),d(null)}function k(w){w.key==="Enter"&&m(),w.key==="Escape"&&d(null)}return e.jsxs("div",{className:"tab-bar",children:[r.map(w=>e.jsxs("div",{className:`tab-bar__tab${w.isActive?" tab-bar__tab--active":""}`,onClick:()=>c(w),onDoubleClick:E=>x(E,w),title:w.savePath??w.name,children:[l===w.id?e.jsx("input",{ref:h,className:"tab-bar__rename-input",value:u,onChange:E=>g(E.target.value),onBlur:m,onKeyDown:k,onClick:E=>E.stopPropagation(),autoFocus:!0}):e.jsx("span",{className:"tab-bar__tab-name",children:w.name}),w.dirty&&e.jsx("span",{className:"tab-bar__dirty",title:"Unsaved changes",children:"●"}),e.jsx("button",{className:"tab-bar__close",onClick:E=>b(E,w),title:"Close tab",children:e.jsx(S0,{size:10})})]},w.id)),e.jsx("button",{className:"tab-bar__new",onClick:n,title:"New project",children:e.jsx(oe,{size:13})})]})}function Nc({menus:n,quickActions:r,stat:t}){const[s,a]=o.useState(null),i=o.useRef(null);o.useEffect(()=>{function u(h){i.current&&!i.current.contains(h.target)&&a(null)}function g(h){h.key==="Escape"&&a(null)}return document.addEventListener("mousedown",u),document.addEventListener("keydown",g),()=>{document.removeEventListener("mousedown",u),document.removeEventListener("keydown",g)}},[]);function l(u){a(g=>g===u?null:u)}function d(u){u.action?.(),a(null)}return e.jsxs("div",{className:"menubar",ref:i,children:[n.map((u,g)=>e.jsxs("div",{className:`menubar__menu${s===g?" menubar__menu--open":""}`,onMouseDown:()=>l(g),onMouseEnter:()=>s!==null&&s!==g&&a(g),children:[u.label,s===g&&e.jsx("div",{className:"menu-dropdown",onMouseDown:h=>h.stopPropagation(),children:u.items.map((h,c)=>"sep"in h?e.jsx("div",{className:"menu-dropdown__sep"},c):e.jsxs("button",{className:"menu-dropdown__item",disabled:h.disabled||!h.action,onMouseDown:()=>!h.disabled&&h.action&&d(h),children:[e.jsxs("span",{className:"menu-dropdown__label",children:[e.jsx("span",{className:"menu-dropdown__icon",children:h.icon}),h.label]}),h.shortcut&&e.jsx("span",{className:"menu-dropdown__shortcut",children:h.shortcut})]},c))})]},u.label)),r&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"menubar__sep"}),r]}),t&&e.jsx("span",{className:"menubar__stat",children:t})]})}function ba({tab:n,onSave:r,onDiscard:t,onCancel:s,quitting:a,progress:i,busy:l}){const d=!n.savePath;return e.jsxs(Nn,{title:a?"Save before quitting?":"Unsaved Changes",size:"sm",onClose:l?()=>{}:s,children:[e.jsxs("div",{className:"modal-body",children:[a&&i&&i.total>1&&e.jsx("p",{className:"settings-hint",style:{marginBottom:8},children:e.jsxs("strong",{style:{color:"var(--text)"},children:["Project ",i.index+1," of ",i.total]})}),e.jsx("p",{className:"settings-hint",children:a?e.jsxs(e.Fragment,{children:["“",n.name,"” has unsaved changes that aren’t in its file yet. Save them before quitting?",d&&" (This project has never been saved to a file.)"]}):d?e.jsxs(e.Fragment,{children:["“",n.name,"” has never been saved to a file. If you close it now, its contents will be ",e.jsx("strong",{style:{color:"var(--text)"},children:"permanently lost"}),"."]}):e.jsxs(e.Fragment,{children:["“",n.name,"” has unsaved changes that aren’t in its file yet. Closing without saving will discard them."]})})]}),e.jsxs("div",{className:"modal-footer",children:[e.jsx("button",{className:"btn btn--danger btn--sm",onClick:t,disabled:l,children:"Don’t Save"}),e.jsx("span",{className:"modal-footer__spacer"}),e.jsx("button",{className:"btn btn--ghost btn--sm",onClick:s,disabled:l,children:"Cancel"}),e.jsx("button",{className:"btn btn--primary btn--sm",onClick:r,disabled:l,children:l?e.jsxs(e.Fragment,{children:[e.jsx(er,{size:13,className:"spin"})," Saving…"]}):d?"Save As…":"Save"})]})]})}const wt=["#d68b2a","#00b0c8","#3d9e5f","#c83030","#5588bb","#c97a1a","#7766aa","#888888"],_c=[{id:"eventDate",label:"Event Date"},{id:"description",label:"Description"},{id:"color",label:"Accent Color",editOnly:!0},{id:"links",label:"Links",editOnly:!0}];function xa(n,r){if(!n)return new Set(r.map(s=>`param:${s}`));const t=new Set;n.eventDate&&t.add("eventDate"),n.description&&n.kind!=="note"&&t.add("description"),n.color&&t.add("color"),n.links?.length&&t.add("links");for(const s of n.media??[])t.add(`media:${s.id}`);for(const s of r){const a=n.paramValues?.find(i=>i.paramDefId===s);a?.value!=null&&a.value!==""&&t.add(`param:${s}`)}return t}function Ic({node:n,defaultPosition:r,onClose:t,onSave:s,onDelete:a,onAddLink:i,onRemoveLink:l,onAddMedia:d,onUpdateMedia:u,onUpdateMediaShowOnCard:g,onReorderMedia:h,onRemoveMedia:c,edges:b,allNodes:x,onNavigateToNode:m,isPinned:k,onTogglePin:w,readOnly:E}){const{activeParamDefs:j}=Se(),v=!n,[f,I]=o.useState(!1),p=(()=>{if(v||!n||!b||!x)return[];const y=new Set,Y=[];for(const t0 of b){if(t0.sourceId!==n.id&&t0.targetId!==n.id)continue;const K=t0.sourceId===n.id?t0.targetId:t0.sourceId;if(y.has(K))continue;y.add(K);const k0=x.find(b0=>b0.id===K);k0&&Y.push(k0)}return Y})(),[A,F]=o.useState(n?.title??""),[Z,H]=o.useState(n?.description??""),[J,C]=o.useState(n?.eventDate??""),[z,L]=o.useState(n?.color??""),[P,W]=o.useState({}),[_,a0]=o.useState(n?.tags??[]),[c0,B]=o.useState(""),[S,E0]=o.useState(""),[Y0,A0]=o.useState(""),[I0,q0]=o.useState(n?.media??[]),[W0,H0]=o.useState([]),[U0,F0]=o.useState(null),[M0,M]=o.useState(null),[O,$]=o.useState(null),[V,d0]=o.useState([]),[m0,R0]=o.useState(!1),[J0,g0]=o.useState(()=>xa(n,j.map(y=>y.id))),[N0,O0]=o.useState(!1),[Q0,X0]=o.useState(!0),ee=o.useRef(null),B0=o.useRef(null);o.useEffect(()=>{F(n?.title??""),H(n?.description??""),C(n?.eventDate??""),L(n?.color??"");const y={};for(const K of n?.paramValues??[])y[K.paramDefId]={value:K.value??"",isEnabled:K.isEnabled,showOnCard:K.showOnCard};W(y),d0([]),g0(xa(n,j.map(K=>K.id))),a0(n?.tags??[]),B(""),q0(n?.media??[]),F0(null),M(null),$(null);const Y=n?.kind,t0=(Y==="image"||Y==="video"||Y==="audio"||Y==="file")&&(n?.media?.length??0)===0;H0(t0?[{tempId:crypto.randomUUID(),mediaType:Y,srcType:"file",src:"",label:""}]:[])},[n?.id]),o.useEffect(()=>{v&&setTimeout(()=>ee.current?.focus(),50)},[]),o.useEffect(()=>{if(!N0)return;function y(Y){B0.current&&!B0.current.contains(Y.target)&&O0(!1)}return document.addEventListener("mousedown",y),()=>document.removeEventListener("mousedown",y)},[N0]);function y0(y){return J0.has(y)}function D(y){g0(Y=>new Set([...Y,y])),O0(!1)}function i0(y){if(g0(Y=>{const t0=new Set(Y);return t0.delete(y),t0}),y.startsWith("param:")){const Y=y.slice(6);W(t0=>{const K={...t0};return delete K[Y],K})}}function n0(){return[]}function C0(){return j.map(y=>{const Y=P[y.id];return{paramDefId:y.id,value:Y?.value||null,isEnabled:Y?.isEnabled??!0,showOnCard:Y?.showOnCard??y.showOnCardDefault}})}async function P0(){const y=n0();if(y.length){d0(y);return}if(d0([]),R0(!0),n&&d){for(const K of W0)if(K.src.trim())try{const k0=await d({nodeId:n.id,label:K.label.trim(),src:K.src.trim(),srcType:K.srcType,mediaType:K.mediaType,showOnCard:!0});q0(b0=>[...b0,k0]),g0(b0=>new Set([...b0,`media:${k0.id}`]))}catch{}}H0([]);const Y=r??{x:100,y:100},t0=C0();try{if(M0)try{await ge(M0)}catch(K){throw new Error(`media: ${K instanceof Error?K.message:String(K)}`)}n?await s({id:n.id,title:A.trim(),description:n.kind==="note"?n.description??null:y0("description")&&Z||null,eventDate:y0("eventDate")&&J||null,x:n.x,y:n.y,color:y0("color")&&z||null,confidence:n.confidence??null,impactMagnitude:n.impactMagnitude??null,paramValues:t0,tags:_}):await s({title:A.trim(),description:y0("description")&&Z||null,eventDate:y0("eventDate")&&J||null,x:Y.x,y:Y.y,color:null,confidence:null,impactMagnitude:null,paramValues:t0,tags:_})}catch(K){d0([`Save failed: ${K instanceof Error?K.message:String(K)}`])}finally{R0(!1)}}function _0(){!S.trim()||!n||(i?.({nodeId:n.id,url:S.trim(),label:Y0.trim()||null}),E0(""),A0(""))}const D0={image:["jpg","jpeg","png","gif","webp","svg","bmp","avif"],video:["mp4","webm","mov","avi","mkv","m4v"],audio:["mp3","wav","ogg","flac","aac","m4a","opus"]};function G(y){const Y=crypto.randomUUID();H0(t0=>[...t0,{tempId:Y,mediaType:y,srcType:"file",src:"",label:""}]),O0(!1)}function h0(y){const Y=D0[y];return Y?[{name:y.charAt(0).toUpperCase()+y.slice(1),extensions:Y}]:void 0}async function L0(y){const Y=W0.find(K=>K.tempId===y);if(!Y)return;const t0=await Qn({filters:h0(Y.mediaType)});if(typeof t0=="string"){const K=Dr(t0);H0(k0=>k0.map(b0=>b0.tempId===y?{...b0,src:t0,label:b0.label||(b0.mediaType==="file"?K:b0.label)}:b0)),Y.mediaType==="file"&&n?.kind==="file"&&!A.trim()&&F(K)}}function ne(y,Y){H0(t0=>t0.map(K=>K.tempId===y?{...K,...Y}:K))}async function Ee(y){const Y=W0.find(K=>K.tempId===y);if(!Y||!Y.src.trim()||!n||!d)return;const t0=await d({nodeId:n.id,label:Y.label.trim(),src:Y.src.trim(),srcType:Y.srcType,mediaType:Y.mediaType,showOnCard:!0});q0(K=>[...K,t0]),g0(K=>new Set([...K,`media:${t0.id}`])),H0(K=>K.filter(k0=>k0.tempId!==y))}function De(y){H0(Y=>Y.filter(t0=>t0.tempId!==y))}function Ue(y){n&&q0(Y=>Y.map(t0=>{if(t0.id!==y)return t0;const K={...t0,showOnCard:!t0.showOnCard};return g?.(y,n.id,K.showOnCard),K}))}function K0(y,Y){n&&(q0(t0=>{const K=[...t0],k0=K.findIndex(we=>we.id===y);if(k0<0)return t0;const b0=Y==="up"?k0-1:k0+1;return b0<0||b0>=K.length?t0:([K[k0],K[b0]]=[K[b0],K[k0]],K)}),h?.(n.id,y,Y))}function z0(y){n&&(c?.(y,n.id),q0(Y=>Y.filter(t0=>t0.id!==y)),g0(Y=>{const t0=new Set(Y);return t0.delete(`media:${y}`),t0}),U0===y&&F0(null),M0===y&&(M(null),$(null)))}function He(y){M(y.id),$({src:y.src,srcType:y.srcType,label:y.label??""}),F0(null)}function re(){M(null),$(null)}async function ue(){if(!M0||!O)return;const y=I0.find(t0=>t0.id===M0);if(!y)return;const Y=await Qn({filters:h0(y.mediaType)});typeof Y=="string"&&$(t0=>t0?{...t0,src:Y}:null)}async function ge(y){if(!O||!n||!u||!O.src.trim())return;const Y=await u(y,n.id,O.label.trim()||null,O.src.trim(),O.srcType);q0(t0=>t0.map(K=>K.id===y?Y:K)),M(null),$(null)}function be(y){const Y=y.srcType==="file"?y.src:y.src,t0=ns(y.id);return t0?Y+(Y.includes("?")?"&":"?")+t0:Y}function $0(y){return y.label?y.label:y.src.split(/[/\\]/).pop()??y.src}const ye=[..._c.filter(y=>y.editOnly&&v||y.id==="description"&&n?.kind==="note"?!1:!y0(y.id)),...j.filter(y=>!y0(`param:${y.id}`)).map(y=>({id:`param:${y.id}`,label:y.displayName}))];return e.jsxs("aside",{className:`detail-panel${E?" detail-panel--readonly":""}`,children:[e.jsxs("div",{className:"detail-panel__header",children:[e.jsx("h2",{title:n?me(n):void 0,children:v?"Add Node":n?me(n):"Edit Node"}),e.jsx("button",{className:"icon-btn",onClick:t,title:"Close",children:e.jsx(S0,{size:16})})]}),e.jsxs("div",{className:"detail-panel__body",children:[E&&e.jsx("div",{className:"panel-readonly-note",children:"View only — editing is disabled. You can still open links, jump to connected nodes, and view media."}),e.jsxs("fieldset",{className:"panel-edit-fieldset",children:[V.map(y=>e.jsx("div",{className:"form-error",children:y},y)),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Title"}),e.jsx("input",{ref:ee,value:A,onChange:y=>F(y.target.value),onKeyDown:y=>{y.key==="Enter"&&!y.shiftKey&&(y.preventDefault(),P0())},placeholder:"Node title (optional)",maxLength:200})]}),j.map(y=>{const Y=`param:${y.id}`;if(!y0(Y))return null;const t0=P[y.id]??{value:y.defaultValue??"",isEnabled:!0,showOnCard:y.showOnCardDefault},K=b0=>W(we=>({...we,[y.id]:{...t0,...b0}})),k0=y.paramType==="select_color"||y.paramType==="select"?y.options.find(b0=>b0.valueSlug===t0.value):null;return e.jsxs("div",{className:"form-group",children:[e.jsxs("div",{className:"form-group__header",children:[e.jsx("label",{children:y.displayName}),e.jsxs("label",{className:`show-on-card-toggle${t0.showOnCard?" show-on-card-toggle--active":""}`,title:"Show this field on the node card",children:[e.jsx("input",{type:"checkbox",checked:t0.showOnCard??!1,onChange:b0=>K({showOnCard:b0.target.checked})}),"on card"]}),e.jsx("button",{className:"icon-btn icon-btn--muted",onClick:()=>i0(Y),title:"Remove field",children:e.jsx(S0,{size:11})})]}),y.paramType==="select_color"||y.paramType==="select"?e.jsxs("div",{className:"select-color-wrap",children:[k0?.color&&e.jsx("span",{className:"select-color-dot",style:{background:k0.color}}),e.jsxs("select",{value:t0.value,onChange:b0=>K({value:b0.target.value}),children:[e.jsx("option",{value:"",children:"— None —"}),y.options.map(b0=>e.jsx("option",{value:b0.valueSlug,children:b0.label},b0.id))]})]}):y.paramType==="boolean"?e.jsxs("label",{className:"checkbox-label",children:[e.jsx("input",{type:"checkbox",checked:t0.value==="true",onChange:b0=>K({value:b0.target.checked?"true":"false"})}),"Enabled"]}):y.paramType==="number"?e.jsx("input",{type:"number",value:t0.value,onChange:b0=>K({value:b0.target.value}),placeholder:y.defaultValue??""}):e.jsx("input",{type:"text",value:t0.value,onChange:b0=>K({value:b0.target.value}),placeholder:y.defaultValue??""})]},y.id)}),y0("eventDate")&&e.jsxs("div",{className:"form-group",children:[e.jsxs("div",{className:"form-group__header",children:[e.jsx("label",{children:"Event Date"}),e.jsx("button",{className:"icon-btn icon-btn--muted",onClick:()=>i0("eventDate"),title:"Remove field",children:e.jsx(S0,{size:11})})]}),e.jsx("input",{type:"date",value:J,onChange:y=>C(y.target.value)})]}),y0("description")&&n?.kind!=="note"&&e.jsxs("div",{className:"form-group",children:[e.jsxs("div",{className:"form-group__header",children:[e.jsx("label",{children:"Description"}),e.jsx("button",{className:"icon-btn icon-btn--muted",onClick:()=>i0("description"),title:"Remove field",children:e.jsx(S0,{size:11})})]}),e.jsx("textarea",{value:Z,onChange:y=>H(y.target.value),placeholder:"Description or notes…",rows:4})]}),!v&&y0("color")&&e.jsxs("div",{className:"form-group",children:[e.jsxs("div",{className:"form-group__header",children:[e.jsx("label",{children:"Accent Color"}),e.jsx("button",{className:"icon-btn icon-btn--muted",onClick:()=>i0("color"),title:"Remove field",children:e.jsx(S0,{size:11})})]}),e.jsxs("div",{className:"color-picker",children:[e.jsx("button",{className:`color-swatch color-swatch--clear ${z===""?"color-swatch--active":""}`,onClick:()=>L(""),title:"Use field color"}),wt.map(y=>e.jsx("button",{className:`color-swatch ${z===y?"color-swatch--active":""}`,style:{background:y},onClick:()=>L(Y=>Y===y?"":y),title:y},y))]}),e.jsx("span",{className:"form-hint",children:z?"Custom color — overrides field color":"Using field color"})]}),!v&&y0("links")&&e.jsxs("div",{className:"form-group",children:[e.jsxs("div",{className:"form-group__header",children:[e.jsx("label",{children:"Links"}),e.jsx("button",{className:"icon-btn icon-btn--muted",onClick:()=>i0("links"),title:"Remove field",children:e.jsx(S0,{size:11})})]}),n.links.length===0&&e.jsx("span",{className:"form-hint",children:"No links yet"}),n.links.map(y=>{const Y=/^https?:\/\//i.test(y.url)?y.url:`https://${y.url}`;return e.jsxs("div",{className:"link-row",children:[e.jsxs("button",{className:"link-url nav-allowed",onClick:()=>Sr(Y),title:y.url,children:[e.jsx(dt,{size:12}),y.label||y.url]}),e.jsx("button",{className:"icon-btn icon-btn--danger",onClick:()=>l?.(y.id,n.id),title:"Remove link",children:e.jsx(S0,{size:12})})]},y.id)}),e.jsxs("div",{className:"link-add",children:[e.jsx("input",{value:S,onChange:y=>E0(y.target.value),placeholder:"https://…",onKeyDown:y=>{y.key==="Enter"&&(y.preventDefault(),_0())}}),e.jsx("input",{value:Y0,onChange:y=>A0(y.target.value),placeholder:"Label (optional)",onKeyDown:y=>{y.key==="Enter"&&(y.preventDefault(),_0())}}),e.jsxs("button",{className:"btn btn--ghost",onClick:_0,disabled:!S.trim(),children:[e.jsx(oe,{size:13})," Add Link"]})]})]}),!v&&I0.filter(y=>y0(`media:${y.id}`)).map((y,Y,t0)=>e.jsxs("div",{className:"form-group",children:[e.jsxs("div",{className:"form-group__header",children:[e.jsx("span",{className:"media-item__icon",children:y.mediaType==="image"?e.jsx(Je,{size:12}):y.mediaType==="video"?e.jsx(on,{size:12}):y.mediaType==="audio"?e.jsx(wn,{size:12}):e.jsx(Xn,{size:12})}),e.jsx("label",{className:"media-item__label",title:y.src,children:M0===y.id&&O&&O.label||$0(y)}),e.jsxs("label",{className:`show-on-card-toggle${y.showOnCard?" show-on-card-toggle--active":""}`,title:"Show on node card",children:[e.jsx("input",{type:"checkbox",checked:y.showOnCard,onChange:()=>Ue(y.id)}),"on card"]}),M0!==y.id&&e.jsx("button",{className:"icon-btn",onClick:()=>F0(K=>K===y.id?null:y.id),title:U0===y.id?"Collapse":"Preview",children:U0===y.id?e.jsx(Ae,{size:11}):e.jsx(Le,{size:11})}),h&&t0.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"icon-btn",onClick:()=>K0(y.id,"up"),disabled:Y===0,title:"Move up",children:e.jsx(Wo,{size:11})}),e.jsx("button",{className:"icon-btn",onClick:()=>K0(y.id,"down"),disabled:Y===t0.length-1,title:"Move down",children:e.jsx($o,{size:11})})]}),e.jsx("button",{className:`icon-btn${M0===y.id?" icon-btn--active":""}`,onClick:()=>M0===y.id?re():He(y),title:M0===y.id?"Cancel edit":"Edit",children:e.jsx(_n,{size:11})}),e.jsx("button",{className:"icon-btn nav-allowed",onClick:()=>y.srcType==="file"?rs(y.src):Sr(y.src),title:"Open externally",children:e.jsx(dt,{size:11})}),n?.kind!==y.mediaType&&e.jsx("button",{className:"icon-btn icon-btn--danger",onClick:()=>z0(y.id),title:"Delete",children:e.jsx(S0,{size:11})})]}),M0===y.id&&O&&e.jsxs("div",{className:"media-add",children:[e.jsxs("select",{value:O.srcType,onChange:K=>$(k0=>k0?{...k0,srcType:K.target.value,src:""}:null),className:"media-add__srctype",children:[e.jsx("option",{value:"file",children:"File"}),e.jsx("option",{value:"url",children:"URL"})]}),O.srcType==="file"?e.jsxs("div",{className:"media-add__file-row",children:[e.jsx("input",{value:O.src,readOnly:!0,placeholder:"No file selected",className:"media-add__path"}),e.jsxs("button",{className:"btn btn--ghost",onClick:ue,children:[e.jsx(lt,{size:13})," Browse"]})]}):e.jsx("input",{value:O.src,onChange:K=>$(k0=>k0?{...k0,src:K.target.value}:null),placeholder:"https://…"}),e.jsx("input",{value:O.label,onChange:K=>$(k0=>k0?{...k0,label:K.target.value}:null),placeholder:"Label (optional)"}),e.jsxs("div",{className:"media-edit-actions",children:[e.jsx("span",{className:"form-hint",children:"Applied when you click “Save Changes”."}),e.jsx("button",{className:"btn btn--ghost",onClick:re,children:"Cancel edit"})]})]}),M0!==y.id&&U0===y.id&&e.jsxs("div",{className:"media-item__preview",children:[y.mediaType==="image"&&e.jsx("img",{src:be(y),alt:y.label||y.src,className:"media-viewer--image",onError:K=>{K.currentTarget.alt="⚠ Failed to load image"}}),y.mediaType==="video"&&e.jsx("video",{controls:!0,className:"media-viewer--video",children:e.jsx("source",{src:be(y)})}),y.mediaType==="audio"&&e.jsx("audio",{controls:!0,className:"media-viewer--audio",children:e.jsx("source",{src:be(y)})})]})]},y.id)),!v&&W0.map(y=>e.jsxs("div",{className:"form-group",children:[e.jsxs("div",{className:"form-group__header",children:[e.jsx("span",{className:"media-item__icon",children:y.mediaType==="image"?e.jsx(Je,{size:12}):y.mediaType==="video"?e.jsx(on,{size:12}):y.mediaType==="audio"?e.jsx(wn,{size:12}):e.jsx(Xn,{size:12})}),e.jsxs("label",{children:["New ",y.mediaType]}),n?.kind!==y.mediaType&&e.jsx("button",{className:"icon-btn icon-btn--muted",onClick:()=>De(y.tempId),title:"Cancel",children:e.jsx(S0,{size:11})})]}),e.jsxs("div",{className:"media-add",children:[e.jsxs("select",{value:y.srcType,onChange:Y=>ne(y.tempId,{srcType:Y.target.value,src:""}),className:"media-add__srctype",children:[e.jsx("option",{value:"file",children:"File"}),e.jsx("option",{value:"url",children:"URL"})]}),y.srcType==="file"?e.jsxs("div",{className:"media-add__file-row",children:[e.jsx("input",{value:y.src,readOnly:!0,placeholder:"No file selected",className:"media-add__path"}),e.jsxs("button",{className:"btn btn--ghost",onClick:()=>L0(y.tempId),children:[e.jsx(lt,{size:13})," Browse"]})]}):e.jsx("input",{value:y.src,onChange:Y=>ne(y.tempId,{src:Y.target.value}),placeholder:"https://…"}),e.jsx("input",{value:y.label,onChange:Y=>ne(y.tempId,{label:Y.target.value}),placeholder:"Label (optional)"}),e.jsxs("button",{className:"btn btn--ghost",onClick:()=>Ee(y.tempId),disabled:!y.src.trim(),children:[e.jsx(oe,{size:13})," Add"]})]})]},y.tempId)),!v&&n&&e.jsxs("div",{className:"node-meta-added",children:["Added ",n.dateAdded.split("T")[0]]}),p.length>0&&e.jsxs("div",{className:"connected-nodes",children:[e.jsxs("button",{className:"connected-nodes__toggle",onClick:()=>X0(y=>!y),children:[Q0?e.jsx(Ae,{size:10}):e.jsx(Le,{size:10}),e.jsx("span",{children:"Connected to"}),e.jsx("span",{className:"connected-nodes__count",children:p.length})]}),Q0&&e.jsx("div",{className:"connected-nodes__list",children:p.map(y=>e.jsx("button",{className:"connected-node-item nav-allowed",onClick:()=>m?.(y),title:y.title,children:y.title},y.id))})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Tags"}),e.jsxs("div",{className:"tag-chips",children:[_.map(y=>e.jsxs("span",{className:"tag-chip",children:[y,e.jsx("button",{className:"tag-chip__remove",onClick:()=>a0(Y=>Y.filter(t0=>t0!==y)),title:`Remove tag "${y}"`,children:e.jsx(S0,{size:9})})]},y)),e.jsx("input",{className:"tag-chip-input",value:c0,onChange:y=>B(y.target.value),onKeyDown:y=>{if((y.key==="Enter"||y.key===",")&&c0.trim()){y.preventDefault();const Y=c0.trim().replace(/,+$/,"");Y&&!_.includes(Y)&&a0(t0=>[...t0,Y]),B("")}else y.key==="Backspace"&&!c0&&_.length&&a0(Y=>Y.slice(0,-1))},placeholder:_.length?"":"Add tag…"})]})]}),(ye.length>0||!v)&&e.jsxs("div",{className:"add-field-wrap",ref:B0,children:[e.jsxs("button",{className:"btn btn--ghost add-field-btn",onClick:()=>O0(y=>!y),children:[e.jsx(oe,{size:12}),"Add field",e.jsx(Ae,{size:12,style:{marginLeft:"auto",opacity:.6}})]}),N0&&e.jsxs("div",{className:"add-field-dropdown",children:[ye.map(y=>e.jsx("button",{className:"add-field-item",onClick:()=>D(y.id),children:y.label},y.id)),!v&&e.jsxs(e.Fragment,{children:[ye.length>0&&e.jsx("div",{className:"add-field-sep"}),e.jsxs("button",{className:"add-field-item",onClick:()=>G("image"),children:[e.jsx(Je,{size:11})," Image"]}),e.jsxs("button",{className:"add-field-item",onClick:()=>G("video"),children:[e.jsx(on,{size:11})," Video"]}),e.jsxs("button",{className:"add-field-item",onClick:()=>G("audio"),children:[e.jsx(wn,{size:11})," Audio"]})]})]})]})]})]}),e.jsxs("div",{className:"detail-panel__footer",children:[n&&a&&e.jsxs("button",{className:"btn btn--danger",onClick:()=>a(n.id),disabled:m0||E,children:[e.jsx(Ve,{size:14})," Delete"]}),n&&e.jsx("button",{className:"btn btn--ghost",title:"Copy node ID to clipboard",onClick:()=>{navigator.clipboard.writeText(n.id),I(!0),setTimeout(()=>I(!1),1500)},children:f?e.jsx(Qe,{size:14}):e.jsx(jn,{size:14})}),n&&w&&e.jsx("button",{className:`btn btn--ghost${k?" btn--on":""}`,onClick:w,disabled:m0||E,title:k?"Unpin position":"Pin position — prevents accidental dragging",children:k?e.jsx(Ga,{size:14}):e.jsx(qa,{size:14})}),e.jsx("button",{className:"btn btn--primary",onClick:P0,disabled:m0||E,children:m0?e.jsxs(e.Fragment,{children:[e.jsx(er,{size:14,className:"spin"})," ",v?"Adding…":"Saving…"]}):v?e.jsxs(e.Fragment,{children:[e.jsx(oe,{size:14})," Add Node"]}):"Save Changes"})]})]})}function va(n,r){const t={};for(const s of r){const a=n.paramValues.find(i=>i.paramDefId===s.id);t[s.id]=a?{value:a.value??null,isEnabled:a.isEnabled}:{value:s.defaultValue??null,isEnabled:!1}}return t}function ya(n,r){const t=new Set;for(const s of r){const a=n.paramValues.find(i=>i.paramDefId===s.id);(a&&(a.isEnabled||a.value!=null)||s.defaultValue!=null)&&t.add(s.id)}return t}function Cc({edge:n,nodes:r,onClose:t,onSave:s,onDelete:a,onFlipEdge:i,onSelectNode:l,readOnly:d}){const{activeEdgeParamDefs:u,getEdgeArrow:g}=Se(),[h,c]=o.useState(()=>va(n,u)),[b,x]=o.useState(()=>ya(n,u)),[m,k]=o.useState(n.color??""),[w,E]=o.useState(!1),[j,v]=o.useState(!1),[f,I]=o.useState(!1),[p,A]=o.useState(null),F=o.useRef(null);o.useEffect(()=>{c(va(n,u)),x(ya(n,u)),k(n.color??""),E(!1),A(null)},[n.id]),o.useEffect(()=>{if(!w)return;function B(S){F.current&&!F.current.contains(S.target)&&E(!1)}return document.addEventListener("mousedown",B),()=>document.removeEventListener("mousedown",B)},[w]);const Z=r.find(B=>B.id===n.sourceId),H=r.find(B=>B.id===n.targetId),J=j||f,C=u.find(B=>B.drivesArrow),z=C?h[C.id]?.value!=="false":g(n),L=u.filter(B=>!b.has(B.id));function P(B){x(S=>new Set([...S,B.id])),c(S=>({...S,[B.id]:S[B.id]?{...S[B.id],isEnabled:!0}:{value:B.defaultValue??null,isEnabled:!0}})),E(!1)}function W(B){x(S=>{const E0=new Set(S);return E0.delete(B),E0}),c(S=>({...S,[B]:{...S[B],isEnabled:!1}}))}function _(B,S){c(E0=>({...E0,[B]:{value:S,isEnabled:E0[B]?.isEnabled??!0}}))}async function a0(){A(null),v(!0);try{const B=u.map(S=>({paramDefId:S.id,value:h[S.id]?.value??null,isEnabled:b.has(S.id)}));await s({id:n.id,paramValues:B,label:n.label??null,color:m||null})}catch(B){A(B instanceof Error?B.message:"Save failed. Please try again.")}finally{v(!1)}}async function c0(){A(null),I(!0);try{await a(n.id)}catch(B){A(B instanceof Error?B.message:"Delete failed. Please try again.")}finally{I(!1)}}return e.jsxs("aside",{className:`detail-panel${d?" detail-panel--readonly":""}`,children:[e.jsxs("div",{className:"detail-panel__header",children:[e.jsx("h2",{children:"Connection"}),e.jsx("button",{className:"icon-btn",onClick:t,title:"Close",disabled:J,children:e.jsx(S0,{size:16})})]}),e.jsxs("div",{className:"detail-panel__body",children:[d&&e.jsx("div",{className:"panel-readonly-note",children:"View only — editing is disabled. You can still jump to the connected nodes."}),e.jsxs("fieldset",{className:"panel-edit-fieldset",children:[p&&e.jsx("div",{className:"form-error",children:p}),e.jsxs("div",{className:"edge-nodes",children:[e.jsx("button",{className:"edge-node-label edge-node-label--btn nav-allowed",title:Z?`Open: ${Z.title}`:void 0,onClick:()=>Z&&l?.(Z),disabled:!Z||!l,children:Z?.title??n.sourceId}),e.jsx("span",{className:"edge-arrow",children:z?"→":"↔"}),e.jsx("button",{className:"edge-node-label edge-node-label--btn nav-allowed",title:H?`Open: ${H.title}`:void 0,onClick:()=>H&&l?.(H),disabled:!H||!l,children:H?.title??n.targetId}),i&&e.jsx("button",{className:"icon-btn icon-btn--muted edge-flip-btn",onClick:()=>i(n.id),title:"Flip direction",disabled:J,children:e.jsx(Vo,{size:12})})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Edge Color"}),e.jsxs("div",{className:"color-picker",children:[e.jsx("button",{className:`color-swatch color-swatch--clear ${m===""?"color-swatch--active":""}`,onClick:()=>k(""),disabled:J,title:"Default (white)"}),wt.map(B=>e.jsx("button",{className:`color-swatch ${m===B?"color-swatch--active":""}`,style:{background:B},onClick:()=>k(S=>S===B?"":B),disabled:J,title:B},B))]}),e.jsx("span",{className:"form-hint",children:m?"Custom edge color":"Default — white"})]}),u.filter(B=>b.has(B.id)).map(B=>e.jsx(Sc,{def:B,value:h[B.id]?.value??null,disabled:J,onChange:S=>_(B.id,S),onRemove:()=>W(B.id)},B.id)),e.jsxs("div",{className:"panel-add-field",ref:F,children:[e.jsxs("button",{className:"btn btn--ghost btn--sm panel-add-field__btn",onClick:()=>E(B=>!B),disabled:J||L.length===0,children:[e.jsx(oe,{size:12})," Add field",L.length>0&&e.jsx(Ae,{size:11})]}),w&&L.length>0&&e.jsx("div",{className:"panel-field-picker",children:L.map(B=>e.jsxs("button",{className:"panel-field-picker__item",onClick:()=>P(B),children:[e.jsx("span",{children:B.displayName}),e.jsx("span",{className:"param-type-badge",children:B.paramType})]},B.id))})]})]})]}),e.jsxs("div",{className:"detail-panel__footer",children:[e.jsx("button",{className:"btn btn--danger",onClick:c0,disabled:J||d,children:f?e.jsxs(e.Fragment,{children:[e.jsx(er,{size:14,className:"spin"})," Deleting…"]}):e.jsxs(e.Fragment,{children:[e.jsx(Ve,{size:14})," Delete"]})}),e.jsx("button",{className:"btn btn--primary",onClick:a0,disabled:J||d,children:j?e.jsxs(e.Fragment,{children:[e.jsx(er,{size:14,className:"spin"})," Saving…"]}):"Save Changes"})]})]})}function Sc({def:n,value:r,disabled:t,onChange:s,onRemove:a}){return e.jsxs("div",{className:"form-group form-group--param",children:[e.jsxs("div",{className:"form-group__header",children:[e.jsx("label",{children:n.displayName}),e.jsx("button",{className:"icon-btn icon-btn--muted",onClick:a,disabled:t,title:"Remove field",children:e.jsx(S0,{size:11})})]}),n.paramType==="boolean"&&e.jsxs("label",{className:"checkbox-label",children:[e.jsx("input",{type:"checkbox",checked:r==="true",disabled:t,onChange:i=>s(i.target.checked?"true":"false")}),r==="true"?"Yes":"No"]}),n.paramType==="number"&&e.jsx("input",{type:"number",value:r??"",disabled:t,onChange:i=>s(i.target.value||null)}),n.paramType==="text"&&e.jsx("textarea",{value:r??"",disabled:t,rows:3,onChange:i=>s(i.target.value||null)}),(n.paramType==="select"||n.paramType==="select_color")&&(()=>{const i=n.paramType==="select_color"?n.options.find(l=>l.valueSlug===r):null;return e.jsxs("div",{className:"select-color-wrap",children:[i?.color&&e.jsx("span",{className:"select-color-dot",style:{background:i.color}}),e.jsxs("select",{value:r??"",disabled:t,onChange:l=>s(l.target.value||null),children:[e.jsx("option",{value:"",children:"— None —"}),n.options.map(l=>e.jsx("option",{value:l.valueSlug,children:l.label},l.id))]})]})})()]})}function Ec({region:n,nodes:r,defaultPosition:t,onClose:s,onSave:a,onDelete:i,onAutoFit:l,readOnly:d}){const u=!n,[g,h]=o.useState(n?.title??""),[c,b]=o.useState(n?.color??""),[x,m]=o.useState([]),[k,w]=o.useState(!1),E=o.useRef(null);o.useEffect(()=>{h(n?.title??""),b(n?.color??""),m([])},[n?.id]),o.useEffect(()=>{u&&setTimeout(()=>E.current?.focus(),50)},[]);async function j(){if(!g.trim()){m(["Title is required"]);return}m([]),w(!0);try{if(n)await a({id:n.id,title:g.trim(),x:n.x,y:n.y,width:n.width,height:n.height,color:c||null});else{const v=t??{x:0,y:0};await a({title:g.trim(),x:v.x,y:v.y,width:320,height:220,color:c||null})}}catch(v){m([v instanceof Error?v.message:"Save failed."])}finally{w(!1)}}return e.jsxs("aside",{className:`detail-panel${d?" detail-panel--readonly":""}`,children:[e.jsxs("div",{className:"detail-panel__header",children:[e.jsx("h2",{children:u?"Add Node Region":n?.title||"Edit Node Region"}),e.jsx("button",{className:"icon-btn",onClick:s,title:"Close",children:e.jsx(S0,{size:16})})]}),e.jsxs("div",{className:"detail-panel__body",children:[d&&e.jsx("div",{className:"panel-readonly-note",children:"View only — editing is disabled in this session."}),e.jsxs("fieldset",{className:"panel-edit-fieldset",children:[x.map(v=>e.jsx("div",{className:"form-error",children:v},v)),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Title *"}),e.jsx("input",{ref:E,value:g,onChange:v=>h(v.target.value),onKeyDown:v=>{v.key==="Enter"&&(v.preventDefault(),j())},placeholder:"Region title",maxLength:100})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Border Color"}),e.jsxs("div",{className:"color-picker",children:[e.jsx("button",{className:`color-swatch color-swatch--clear ${c?"":"color-swatch--active"}`,onClick:()=>b(""),title:"No color"}),wt.map(v=>e.jsx("button",{className:`color-swatch ${c===v?"color-swatch--active":""}`,style:{background:v},onClick:()=>b(f=>f===v?"":v),title:v},v))]}),e.jsx("span",{className:"form-hint",children:c?"Custom border color":"Default border color"})]})]})]}),e.jsxs("div",{className:"detail-panel__footer",children:[n&&i&&e.jsxs("button",{className:"btn btn--danger",onClick:()=>i(n.id),disabled:k||d,children:[e.jsx(Ve,{size:14})," Delete"]}),n&&l&&r&&(()=>{const v=r.filter(f=>Hn(f,n)).length;return v>0?e.jsxs("button",{className:"btn btn--ghost",onClick:()=>l(n.id),disabled:k||d,title:"Resize to fit member nodes",children:[e.jsx(Wa,{size:13})," Fit (",v,")"]}):null})(),e.jsx("button",{className:"btn btn--primary",onClick:j,disabled:k||d,children:k?e.jsxs(e.Fragment,{children:[e.jsx(er,{size:14,className:"spin"})," Saving…"]}):u?"Add Node Region":"Save Changes"})]})]})}function Dc({nodes:n,edges:r,regions:t,selectedNodeId:s,selectedRegionId:a,onSelectNode:i,onSelectRegion:l,onHighlight:d,onScrollToNode:u,searchFocusTrigger:g,graphNotes:h,onNotesChange:c}){const{activeParamDefs:b,activeEdgeParamDefs:x,getNodeColor:m}=Se(),[k,w]=o.useState(""),[E,j]=o.useState(!1),[v,f]=o.useState({}),[I,p]=o.useState({}),[A,F]=o.useState(new Set),[Z,H]=o.useState(new Set),J=7,[C,z]=o.useState(!1),[L,P]=o.useState(!1),[W,_]=o.useState(!0),[a0,c0]=o.useState(!1),[B,S]=o.useState(null),[E0,Y0]=o.useState(0),[A0,I0]=o.useState("default"),q0=o.useRef(null);o.useEffect(()=>{g&&q0.current?.focus()},[g]);const W0=Array.from(new Set(n.flatMap(D=>D.tags??[]))).sort(),H0=b.filter(D=>D.paramType==="select"||D.paramType==="select_color"),U0=x.filter(D=>D.paramType==="select"||D.paramType==="select_color");o.useEffect(()=>{Y0(0)},[k,JSON.stringify(v),JSON.stringify(I)]);const F0=Object.values(v).some(D=>D!=null)||Object.values(I).some(D=>D!=null)||B!=null,M0=!!(k||F0),M=n.filter(D=>{const i0=!k||me(D).toLowerCase().includes(k.toLowerCase())||D.description?.toLowerCase().includes(k.toLowerCase())||r.some(_0=>(_0.sourceId===D.id||_0.targetId===D.id)&&_0.paramValues.some(D0=>{const G=x.find(L0=>L0.id===D0.paramDefId);return!G||!D0.value?!1:G.options.find(L0=>L0.valueSlug===D0.value)?.label.toLowerCase().includes(k.toLowerCase())??!1})),n0=H0.every(_0=>{const D0=v[_0.id];return D0?D.paramValues.find(G=>G.paramDefId===_0.id)?.value===D0:!0}),C0=U0.every(_0=>{const D0=I[_0.id];return D0?r.some(G=>(G.sourceId===D.id||G.targetId===D.id)&&G.paramValues.find(h0=>h0.paramDefId===_0.id)?.value===D0):!0}),P0=!B||(D.tags??[]).includes(B);return i0&&n0&&C0&&P0});o.useEffect(()=>{d&&d(M0?M.map(D=>D.id):[])},[k,JSON.stringify(v),JSON.stringify(I),B,n.length]);const O=new Map;for(const D of r)O.set(D.sourceId,(O.get(D.sourceId)??0)+1),O.set(D.targetId,(O.get(D.targetId)??0)+1);const $=[{key:"default",label:"Default"},{key:"title",label:"A–Z"},{key:"date",label:"Date"},{key:"degree",label:"# Edges"}];function V(D,i0){f(n0=>({...n0,[D]:n0[D]===i0?null:i0}))}function d0(D,i0){p(n0=>({...n0,[D]:n0[D]===i0?null:i0}))}function m0(D){F(i0=>{const n0=new Set(i0);return n0.has(D)?n0.delete(D):n0.add(D),n0})}function R0(D){if(!D.length)return;const i0=(E0-1+D.length)%D.length;Y0(i0),u?.(D[i0])}function J0(D){if(!D.length)return;const i0=(E0+1)%D.length;Y0(i0),u?.(D[i0])}const g0=A0==="default"?M:[...M].sort((D,i0)=>A0==="title"?me(D).localeCompare(me(i0)):A0==="date"?!D.eventDate&&!i0.eventDate?0:D.eventDate?i0.eventDate?D.eventDate.localeCompare(i0.eventDate):-1:1:A0==="degree"?(O.get(i0.id)??0)-(O.get(D.id)??0):0),N0=new Map(t.map(D=>[D.id,[]])),O0=[];for(const D of g0){const i0=t.find(n0=>Hn(D,n0));i0?N0.get(i0.id).push(D):O0.push(D)}const Q0=t.filter(D=>{const i0=!k||D.title.toLowerCase().includes(k.toLowerCase()),n0=(N0.get(D.id)?.length??0)>0;return i0||n0}),X0=n.length?n.reduce((D,i0)=>(O.get(i0.id)??0)>(O.get(D.id)??0)?i0:D):null,ee=n.length?(r.length*2/n.length).toFixed(1):"—",B0=n.length===0&&t.length===0,y0=!B0&&g0.length===0&&Q0.length===0;return e.jsxs("aside",{className:"sidebar",children:[e.jsxs("div",{className:"sidebar__brand",children:[e.jsx(yt,{size:16}),e.jsx("span",{children:"GloGraph"})]}),e.jsxs("div",{className:"sidebar__search",children:[e.jsx(Za,{size:14}),e.jsx("input",{ref:q0,value:k,onChange:D=>w(D.target.value),placeholder:"Search…"}),k&&e.jsx("button",{className:"icon-btn",onClick:()=>w(""),title:"Clear search",style:{padding:"1px 2px",marginRight:-2},children:e.jsx(S0,{size:11})}),M0&&g0.length>1&&e.jsxs(e.Fragment,{children:[e.jsx("button",{className:"icon-btn sidebar__nav-btn",onClick:()=>R0(g0),title:"Previous match",children:e.jsx(ri,{size:11})}),e.jsx("button",{className:"icon-btn sidebar__nav-btn",onClick:()=>J0(g0),title:"Next match",children:e.jsx(Ae,{size:11})})]})]}),(H0.length>0||U0.length>0||W0.length>0)&&e.jsxs("div",{className:"sidebar__stats-toggle",onClick:()=>P(D=>!D),children:[e.jsx(Ci,{size:11}),e.jsx("span",{children:"Filters"}),F0&&e.jsx("span",{className:"sidebar__filter-active-dot"}),L?e.jsx(Ae,{size:10,style:{marginLeft:"auto"}}):e.jsx(Le,{size:10,style:{marginLeft:"auto"}})]}),L&&e.jsxs(e.Fragment,{children:[H0.length>0&&e.jsx("div",{className:"sidebar__filters",children:H0.map(D=>{const i0=v[D.id]??null;return e.jsxs("div",{className:"filter-group",children:[e.jsx("div",{className:"filter-group__label",children:D.displayName}),e.jsxs("div",{className:"filter-group__chips",children:[e.jsx("button",{className:`filter-chip ${i0===null?"filter-chip--active":""}`,onClick:()=>f(n0=>({...n0,[D.id]:null})),children:"All"}),(Z.has(D.id)?D.options:D.options.slice(0,J)).map(n0=>{const C0=i0===n0.valueSlug;return e.jsx("button",{className:`filter-chip ${C0?"filter-chip--active":""}`,style:C0&&n0.color?{background:n0.color+"33",borderColor:n0.color,color:n0.color}:{},onClick:()=>V(D.id,n0.valueSlug),children:n0.label},n0.id)}),D.options.length>J&&e.jsx("button",{className:"filter-chip filter-chip--more",onClick:()=>H(n0=>{const C0=new Set(n0);return C0.has(D.id)?C0.delete(D.id):C0.add(D.id),C0}),children:Z.has(D.id)?"Less":`+${D.options.length-J}`})]})]},D.id)})}),U0.length>0&&e.jsx("div",{className:"sidebar__filters sidebar__filters--edge",children:U0.map(D=>{const i0=I[D.id]??null;return e.jsxs("div",{className:"filter-group",children:[e.jsxs("div",{className:"filter-group__label",children:[D.displayName,e.jsx("span",{className:"filter-group__edge-tag",children:"edge"})]}),e.jsxs("div",{className:"filter-group__chips",children:[e.jsx("button",{className:`filter-chip ${i0===null?"filter-chip--active":""}`,onClick:()=>p(n0=>({...n0,[D.id]:null})),children:"All"}),(Z.has(D.id)?D.options:D.options.slice(0,J)).map(n0=>{const C0=i0===n0.valueSlug;return e.jsx("button",{className:`filter-chip ${C0?"filter-chip--active":""}`,style:C0&&n0.color?{background:n0.color+"33",borderColor:n0.color,color:n0.color}:{},onClick:()=>d0(D.id,n0.valueSlug),children:n0.label},n0.id)}),D.options.length>J&&e.jsx("button",{className:"filter-chip filter-chip--more",onClick:()=>H(n0=>{const C0=new Set(n0);return C0.has(D.id)?C0.delete(D.id):C0.add(D.id),C0}),children:Z.has(D.id)?"Less":`+${D.options.length-J}`})]})]},D.id)})}),W0.length>0&&e.jsx("div",{className:"sidebar__filters",children:e.jsxs("div",{className:"filter-group",children:[e.jsx("div",{className:"filter-group__label",children:"Tags"}),e.jsxs("div",{className:"filter-group__chips",children:[e.jsx("button",{className:`filter-chip${B===null?" filter-chip--active":""}`,onClick:()=>S(null),children:"All"}),W0.map(D=>e.jsx("button",{className:`filter-chip${B===D?" filter-chip--active":""}`,onClick:()=>S(i0=>i0===D?null:D),children:D},D))]})]})})]}),e.jsxs("div",{className:"sidebar__stats-toggle",onClick:()=>z(D=>!D),children:[e.jsx(Zo,{size:11}),e.jsx("span",{children:"Graph Stats"}),C?e.jsx(Ae,{size:10,style:{marginLeft:"auto"}}):e.jsx(Le,{size:10,style:{marginLeft:"auto"}})]}),C&&e.jsxs("div",{className:"sidebar__stats",children:[e.jsxs("div",{className:"stats-row",children:[e.jsx("span",{className:"stats-label",children:"Nodes"}),e.jsx("span",{className:"stats-val",children:n.length})]}),e.jsxs("div",{className:"stats-row",children:[e.jsx("span",{className:"stats-label",children:"Edges"}),e.jsx("span",{className:"stats-val",children:r.length})]}),e.jsxs("div",{className:"stats-row",children:[e.jsx("span",{className:"stats-label",children:"Regions"}),e.jsx("span",{className:"stats-val",children:t.length})]}),e.jsxs("div",{className:"stats-row",children:[e.jsx("span",{className:"stats-label",children:"Avg edges/node"}),e.jsx("span",{className:"stats-val",children:ee})]}),X0&&e.jsxs("div",{className:"stats-row",children:[e.jsx("span",{className:"stats-label",children:"Most connected"}),e.jsxs("span",{className:"stats-val stats-val--name",title:me(X0),children:[me(X0)," (",O.get(X0.id)??0,")"]})]}),H0.map(D=>{const i0=D.options.map(n0=>({label:n0.label,color:n0.color??null,count:n.filter(C0=>C0.paramValues.find(P0=>P0.paramDefId===D.id)?.value===n0.valueSlug).length})).filter(n0=>n0.count>0);return i0.length?e.jsxs("div",{children:[e.jsx("div",{className:"stats-section-label",children:D.displayName}),i0.map(n0=>e.jsxs("div",{className:"stats-row",children:[e.jsxs("span",{className:"stats-label",style:{display:"flex",alignItems:"center",gap:4},children:[n0.color&&e.jsx("span",{className:"stats-dot",style:{background:n0.color}}),n0.label]}),e.jsx("span",{className:"stats-val",children:n0.count})]},n0.label))]},D.id):null}),U0.map(D=>{const i0=D.options.map(n0=>({label:n0.label,color:n0.color??null,count:r.filter(C0=>C0.paramValues.find(P0=>P0.paramDefId===D.id)?.value===n0.valueSlug).length})).filter(n0=>n0.count>0);return i0.length?e.jsxs("div",{children:[e.jsxs("div",{className:"stats-section-label",children:[D.displayName," ",e.jsx("span",{style:{opacity:.5,fontSize:9},children:"edges"})]}),i0.map(n0=>e.jsxs("div",{className:"stats-row",children:[e.jsxs("span",{className:"stats-label",style:{display:"flex",alignItems:"center",gap:4},children:[n0.color&&e.jsx("span",{className:"stats-dot",style:{background:n0.color}}),n0.label]}),e.jsx("span",{className:"stats-val",children:n0.count})]},n0.label))]},D.id):null})]}),e.jsxs("div",{className:"sidebar__notes-toggle",onClick:()=>j(D=>!D),children:[e.jsx(_r,{size:11}),e.jsx("span",{children:"Graph Notes"}),E?e.jsx(Ae,{size:10,style:{marginLeft:"auto"}}):e.jsx(Le,{size:10,style:{marginLeft:"auto"}})]}),E&&e.jsx("textarea",{className:"sidebar__notes",value:h,onChange:D=>c(D.target.value),placeholder:"Notes about this graph…",rows:5}),e.jsxs("div",{className:"sidebar__stats-toggle",onClick:()=>_(D=>!D),children:[e.jsx(Oi,{size:11}),e.jsx("span",{children:"Nodes"}),W?e.jsx(Ae,{size:10,style:{marginLeft:"auto"}}):e.jsx(Le,{size:10,style:{marginLeft:"auto"}})]}),W&&e.jsxs(e.Fragment,{children:[n.length>1&&e.jsx("div",{className:"sidebar__sort",children:$.map(D=>e.jsx("button",{className:`sort-btn${A0===D.key?" sort-btn--active":""}`,onClick:()=>I0(D.key),children:D.label},D.key))}),e.jsxs("div",{className:"sidebar__list",children:[B0&&e.jsx("p",{className:"sidebar__empty",children:"No nodes yet — add one to get started"}),y0&&e.jsx("p",{className:"sidebar__empty",children:"No nodes match this filter"}),Q0.map(D=>{const i0=N0.get(D.id)??[],n0=A.has(D.id)&&!M0,C0=!n0&&i0.length>0;return e.jsxs("div",{className:"hierarchy-group",children:[e.jsxs("div",{className:`hierarchy-row${a===D.id?" hierarchy-row--active":""}`,children:[e.jsx("button",{className:"hierarchy-toggle",onClick:()=>m0(D.id),disabled:i0.length===0,title:n0?"Expand":"Collapse",children:i0.length>0&&(n0?e.jsx(Le,{size:10}):e.jsx(Ae,{size:10}))}),e.jsxs("button",{className:"hierarchy-label",onClick:()=>l(D),children:[e.jsx("span",{className:"node-list-item__dot node-list-item__dot--region",style:{background:D.color??"#484848"}}),e.jsx("span",{className:"node-list-item__title",children:D.title||"Region"}),n0&&i0.length>0&&e.jsx("span",{className:"hierarchy-count",children:i0.length})]})]}),C0&&e.jsx("div",{className:"hierarchy-children",children:i0.map(P0=>e.jsxs("button",{className:`node-list-item hierarchy-child${s===P0.id?" node-list-item--active":""}`,onClick:()=>i(P0),children:[e.jsx("span",{className:"node-list-item__dot",style:{background:m(P0)}}),e.jsx("span",{className:"node-list-item__title",children:me(P0)}),P0.eventDate&&e.jsx("span",{className:"node-list-item__date",children:P0.eventDate})]},P0.id))})]},D.id)}),O0.length>0&&Q0.length>0&&e.jsxs("div",{className:"hierarchy-row hierarchy-row--uncontained",onClick:()=>c0(D=>!D),children:[e.jsx("button",{className:"hierarchy-toggle",tabIndex:-1,children:a0?e.jsx(Le,{size:10}):e.jsx(Ae,{size:10})}),e.jsxs("span",{className:"hierarchy-label-plain",children:[e.jsx("span",{className:"node-list-item__title",children:"Other Nodes"}),a0&&e.jsx("span",{className:"hierarchy-count",children:O0.length})]})]}),!a0&&O0.map(D=>e.jsxs("button",{className:`node-list-item${Q0.length>0?" hierarchy-child":""}${s===D.id?" node-list-item--active":""}`,onClick:()=>i(D),children:[e.jsx("span",{className:"node-list-item__dot",style:{background:m(D)}}),e.jsx("span",{className:"node-list-item__title",children:me(D)}),D.eventDate&&e.jsx("span",{className:"node-list-item__date",children:D.eventDate})]},D.id))]})]}),e.jsx("div",{className:"sidebar__count",children:M0?`${g0.length} / ${n.length} nodes · ${Q0.length} / ${t.length} regions`:`${n.length} nodes · ${t.length} regions`})]})}function Tc({bookmarks:n,onRestore:r,onSave:t,onDelete:s}){const[a,i]=o.useState(!1),[l,d]=o.useState(""),[u,g]=o.useState(null);function h(){const x=l.trim()||`View ${n.length+1}`;t(x),d(""),i(!1)}function c(){if(!n.length)return;const x=u===null?n.length-1:(u-1+n.length)%n.length;g(x),r(n[x])}function b(){if(!n.length)return;const x=u===null?0:(u+1)%n.length;g(x),r(n[x])}return e.jsxs("div",{className:"bookmark-bar",children:[e.jsxs("span",{className:"bookmark-bar__label",children:[e.jsx(Go,{size:9}),"Bookmarks"]}),n.length>1&&e.jsx("button",{className:"icon-btn bookmark-bar__nav",onClick:c,title:"Previous bookmark",children:e.jsx(Xo,{size:10})}),n.map((x,m)=>e.jsxs("div",{className:`bookmark-chip${u===m?" bookmark-chip--active":""}`,children:[e.jsx("button",{className:"bookmark-chip__name",onClick:()=>{g(m),r(x)},title:`Jump to "${x.name}"`,children:x.name}),e.jsx("button",{className:"bookmark-chip__del",onClick:k=>{k.stopPropagation(),s(x.id),u===m&&g(null)},title:"Delete bookmark",children:e.jsx(S0,{size:8})})]},x.id)),n.length>1&&e.jsx("button",{className:"icon-btn bookmark-bar__nav",onClick:b,title:"Next bookmark",children:e.jsx(Le,{size:10})}),a?e.jsxs("div",{className:"bookmark-add-row",children:[e.jsx("input",{autoFocus:!0,value:l,onChange:x=>d(x.target.value),onKeyDown:x=>{x.key==="Enter"&&(x.preventDefault(),h()),x.key==="Escape"&&(i(!1),d(""))},placeholder:"Bookmark name…",className:"bookmark-add-input"}),e.jsx("button",{className:"btn",style:{padding:"0 8px",fontSize:10,minHeight:18},onClick:h,children:"Save"}),e.jsx("button",{className:"icon-btn",onClick:()=>{i(!1),d("")},style:{padding:"2px"},children:e.jsx(S0,{size:10})})]}):e.jsx("button",{className:"icon-btn bookmark-bar__add",onClick:()=>i(!0),title:"Save current viewport as bookmark (Ctrl+B)",children:e.jsx(oe,{size:11})})]})}function Mc({nodeCount:n,edgeCount:r,regionCount:t,savePath:s,undoCount:a,zoom:i}){const l=s?s.split(/[\\/]/).pop()??s:"Unsaved";return e.jsxs("div",{className:"status-bar",children:[e.jsx("span",{className:"status-bar__file",title:s??void 0,children:l}),e.jsx("span",{className:"status-bar__sep"}),e.jsxs("span",{className:"status-bar__stat",children:[n," nodes"]}),e.jsx("span",{className:"status-bar__dot",children:"·"}),e.jsxs("span",{className:"status-bar__stat",children:[r," edges"]}),e.jsx("span",{className:"status-bar__dot",children:"·"}),e.jsxs("span",{className:"status-bar__stat",children:[t," regions"]}),a>0&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"status-bar__sep"}),e.jsxs("span",{className:"status-bar__undo",children:["↩ ",a," unsaved"]})]}),i!==void 0&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"status-bar__sep"}),e.jsxs("span",{className:"status-bar__stat",children:[Math.round(i*100),"%"]})]})]})}function Oc({sourceTitle:n,onConfirm:r,onCancel:t}){const[s,a]=o.useState(""),i=o.useRef(null);o.useEffect(()=>{function d(u){u.key==="Escape"&&t()}return document.addEventListener("keydown",d),()=>document.removeEventListener("keydown",d)},[t]);function l(){const d=s.trim();d&&r(d)}return We.createPortal(e.jsx("div",{className:"quick-connect-backdrop",onClick:t,children:e.jsxs("div",{className:"quick-connect-dialog",onClick:d=>d.stopPropagation(),children:[e.jsxs("div",{className:"quick-connect-dialog__header",children:[e.jsx(Zt,{size:12,style:{color:"var(--accent)"}}),e.jsxs("span",{children:["Connect from ",e.jsx("span",{className:"quick-connect-dialog__source",children:n})]}),e.jsx("button",{className:"icon-btn",onClick:t,style:{marginLeft:"auto"},children:e.jsx(S0,{size:14})})]}),e.jsx("div",{className:"quick-connect-dialog__body",children:e.jsx("input",{ref:i,autoFocus:!0,value:s,onChange:d=>a(d.target.value),onKeyDown:d=>{d.key==="Enter"&&(d.preventDefault(),l()),d.key==="Escape"&&t()},placeholder:"New node title…"})}),e.jsxs("div",{className:"quick-connect-dialog__footer",children:[e.jsx("button",{className:"btn btn--ghost",onClick:t,children:"Cancel"}),e.jsxs("button",{className:"btn btn--primary",onClick:l,disabled:!s.trim(),children:[e.jsx(Zt,{size:11})," Create + Connect"]})]})]})}),document.body)}function Pc({nodes:n,onSelect:r,onClose:t}){const{getNodeColor:s}=Se(),[a,i]=o.useState(""),[l,d]=o.useState(0),u=o.useRef(null),g=o.useRef(null);o.useEffect(()=>{u.current?.focus()},[]),o.useEffect(()=>{function x(m){m.key==="Escape"&&t()}return document.addEventListener("keydown",x),()=>document.removeEventListener("keydown",x)},[t]);const h=o.useMemo(()=>{const x=a.trim().toLowerCase();return x?n.filter(m=>me(m).toLowerCase().includes(x)||m.description?.toLowerCase().includes(x)||m.eventDate?.includes(x)).slice(0,12):n.slice(0,12)},[n,a]);o.useEffect(()=>{d(0)},[h]);function c(x){r(x),t()}function b(x){x.key==="ArrowDown"?(x.preventDefault(),d(m=>Math.min(m+1,h.length-1))):x.key==="ArrowUp"?(x.preventDefault(),d(m=>Math.max(m-1,0))):x.key==="Enter"?h[l]&&c(h[l]):x.key==="Escape"&&t()}return o.useEffect(()=>{g.current?.children[l]?.scrollIntoView({block:"nearest"})},[l]),We.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"quick-find-overlay",onClick:t}),e.jsxs("div",{className:"quick-find-dialog",role:"dialog","aria-modal":"true","aria-label":"Quick find",children:[e.jsxs("div",{className:"quick-find-input-row",children:[e.jsx(Za,{size:13,className:"quick-find-icon"}),e.jsx("input",{ref:u,className:"quick-find-input",value:a,onChange:x=>i(x.target.value),onKeyDown:b,placeholder:"Find node…",autoComplete:"off"})]}),h.length>0&&e.jsx("div",{ref:g,className:"quick-find-list",children:h.map((x,m)=>e.jsxs("button",{className:`quick-find-item${m===l?" quick-find-item--active":""}`,onMouseEnter:()=>d(m),onClick:()=>c(x),children:[e.jsx("span",{className:"quick-find-dot",style:{background:s(x)}}),e.jsx("span",{className:"quick-find-title",children:me(x)}),x.eventDate&&e.jsx("span",{className:"quick-find-date",children:x.eventDate})]},x.id))}),h.length===0&&a.trim()&&e.jsx("div",{className:"quick-find-empty",children:"No matches"})]})]}),document.body)}const gn=[{kind:"standard",label:"Node",key:"N",icon:e.jsx(oe,{size:13})},{kind:"note",label:"Note",key:"T",icon:e.jsx(ht,{size:13})},{kind:"image",label:"Image",key:"I",icon:e.jsx(Je,{size:13})},{kind:"video",label:"Video",key:"V",icon:e.jsx(on,{size:13})},{kind:"audio",label:"Audio",key:"A",icon:e.jsx(wn,{size:13})},{kind:"file",label:"File",key:"F",icon:e.jsx(Xn,{size:13})}];function Rc({pos:n,onPick:r,onClose:t}){const[s,a]=o.useState(0);o.useEffect(()=>{function l(d){if(d.key==="Escape"){d.preventDefault(),d.stopPropagation(),t();return}if(d.key==="Enter"){d.preventDefault(),d.stopPropagation(),r(gn[s].kind);return}if(d.key==="ArrowDown"){d.preventDefault(),d.stopPropagation(),a(g=>(g+1)%gn.length);return}if(d.key==="ArrowUp"){d.preventDefault(),d.stopPropagation(),a(g=>(g-1+gn.length)%gn.length);return}const u=gn.findIndex(g=>g.key.toLowerCase()===d.key.toLowerCase());u>=0&&(d.preventDefault(),d.stopPropagation(),r(gn[u].kind))}return document.addEventListener("keydown",l,!0),()=>document.removeEventListener("keydown",l,!0)},[s,r,t]);const i={left:Math.max(4,Math.min(n.x,window.innerWidth-184)),top:Math.max(4,Math.min(n.y,window.innerHeight-176))};return We.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"context-menu-overlay",onClick:t,onContextMenu:l=>l.preventDefault()}),e.jsxs("div",{className:"canvas-context-menu create-type-picker",style:i,onContextMenu:l=>l.preventDefault(),children:[e.jsx("div",{className:"create-type-picker__header",children:"Add graph object"}),gn.map((l,d)=>e.jsxs("button",{className:`context-menu-item create-type-picker__item${d===s?" create-type-picker__item--active":""}`,onMouseEnter:()=>a(d),onClick:()=>r(l.kind),children:[l.icon,e.jsx("span",{children:l.label}),e.jsx("kbd",{className:"create-type-picker__key",children:l.key})]},l.kind))]})]}),document.body)}async function zc(n,r){await e0("plugin:clipboard-manager|write_text",{label:r?.label})}async function Ac(){return await e0("plugin:clipboard-manager|read_text")}async function $c(){try{const n=await Ac();if(typeof n=="string")return n}catch{}try{return await navigator.clipboard.readText()}catch{return""}}async function wa(n){try{await zc(n);return}catch{}try{await navigator.clipboard.writeText(n)}catch{}}const Lc=new Set(["text","search","url","tel","password",""]);function Vc(n){return n instanceof HTMLTextAreaElement?!n.disabled&&!n.readOnly:n instanceof HTMLInputElement?!n.disabled&&!n.readOnly&&Lc.has(n.type):!1}function Hc(){const[n,r]=o.useState(null);if(o.useEffect(()=>{function c(b){Vc(b.target)&&(b.preventDefault(),b.stopPropagation(),r({x:b.clientX,y:b.clientY,target:b.target}))}return document.addEventListener("contextmenu",c,!0),()=>document.removeEventListener("contextmenu",c,!0)},[]),o.useEffect(()=>{if(!n)return;const c=()=>r(null),b=x=>{x.key==="Escape"&&(x.stopPropagation(),r(null))};return window.addEventListener("scroll",c,!0),window.addEventListener("resize",c),document.addEventListener("keydown",b,!0),()=>{window.removeEventListener("scroll",c,!0),window.removeEventListener("resize",c),document.removeEventListener("keydown",b,!0)}},[n]),!n)return null;const{target:t}=n,s=t.selectionStart!=null&&t.selectionStart!==t.selectionEnd;function a(){const c=t.selectionStart??0,b=t.selectionEnd??0;return t.value.slice(c,b)}function i(c){t.focus(),c(),r(null)}function l(){wa(a()),r(null)}function d(){wa(a()),t.focus(),document.execCommand("delete"),r(null)}const u=()=>i(()=>t.select());function g(){t.focus(),$c().then(c=>{c&&(t.focus(),document.execCommand("insertText",!1,c))}).finally(()=>r(null))}const h={left:Math.max(4,Math.min(n.x,window.innerWidth-184)),top:Math.max(4,Math.min(n.y,window.innerHeight-140))};return We.createPortal(e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"context-menu-overlay",onMouseDown:()=>r(null),onContextMenu:c=>c.preventDefault()}),e.jsxs("div",{className:"canvas-context-menu",style:h,onContextMenu:c=>c.preventDefault(),children:[e.jsxs("button",{className:"context-menu-item",disabled:!s,onMouseDown:c=>{c.preventDefault(),l()},children:[e.jsx(jn,{size:13})," Copy"]}),e.jsxs("button",{className:"context-menu-item",disabled:!s,onMouseDown:c=>{c.preventDefault(),d()},children:[e.jsx(Xi,{size:13})," Cut"]}),e.jsxs("button",{className:"context-menu-item",onMouseDown:c=>{c.preventDefault(),g()},children:[e.jsx(di,{size:13})," Paste"]}),e.jsx("hr",{className:"context-menu-separator"}),e.jsxs("button",{className:"context-menu-item",onMouseDown:c=>{c.preventDefault(),u()},children:[e.jsx(td,{size:13})," Select All"]})]})]}),document.body)}var ka;(function(n){n.WINDOW_RESIZED="tauri://resize",n.WINDOW_MOVED="tauri://move",n.WINDOW_CLOSE_REQUESTED="tauri://close-requested",n.WINDOW_DESTROYED="tauri://destroyed",n.WINDOW_FOCUS="tauri://focus",n.WINDOW_BLUR="tauri://blur",n.WINDOW_SCALE_FACTOR_CHANGED="tauri://scale-change",n.WINDOW_THEME_CHANGED="tauri://theme-changed",n.WINDOW_CREATED="tauri://window-created",n.WINDOW_SUSPENDED="tauri://suspended",n.WINDOW_RESUMED="tauri://resumed",n.WEBVIEW_CREATED="tauri://webview-created",n.DRAG_ENTER="tauri://drag-enter",n.DRAG_OVER="tauri://drag-over",n.DRAG_DROP="tauri://drag-drop",n.DRAG_LEAVE="tauri://drag-leave"})(ka||(ka={}));var ja;(function(n){n[n.Critical=1]="Critical",n[n.Informational=2]="Informational"})(ja||(ja={}));var Na;(function(n){n.None="none",n.Normal="normal",n.Indeterminate="indeterminate",n.Paused="paused",n.Error="error"})(Na||(Na={}));var _a;(function(n){n.Disabled="disabled",n.Throttle="throttle",n.Suspend="suspend"})(_a||(_a={}));var Ia;(function(n){n.Default="default",n.FluentOverlay="fluentOverlay"})(Ia||(Ia={}));var Ca;(function(n){n.AppearanceBased="appearanceBased",n.Light="light",n.Dark="dark",n.MediumLight="mediumLight",n.UltraDark="ultraDark",n.Titlebar="titlebar",n.Selection="selection",n.Menu="menu",n.Popover="popover",n.Sidebar="sidebar",n.HeaderView="headerView",n.Sheet="sheet",n.WindowBackground="windowBackground",n.HudWindow="hudWindow",n.FullScreenUI="fullScreenUI",n.Tooltip="tooltip",n.ContentBackground="contentBackground",n.UnderWindowBackground="underWindowBackground",n.UnderPageBackground="underPageBackground",n.Mica="mica",n.Blur="blur",n.Acrylic="acrylic",n.Tabbed="tabbed",n.TabbedDark="tabbedDark",n.TabbedLight="tabbedLight"})(Ca||(Ca={}));var Sa;(function(n){n.FollowsWindowActiveState="followsWindowActiveState",n.Active="active",n.Inactive="inactive"})(Sa||(Sa={}));const Fc=Xe/2,Bc=en/2;function Wc(n){const r=o.useRef(n);r.current=n;const[t,s]=o.useState(!1);return o.useEffect(()=>{function a(c,b){return!!document.elementFromPoint(c,b)?.closest(".react-flow")}function i(c,b){const m=document.elementFromPoint(c,b)?.closest(".react-flow__node")?.dataset.id;if(m){if(r.current.nodes.some(k=>k.id===m))return{kind:"node",id:m};if(r.current.regions.some(k=>k.id===m))return{kind:"region"}}return{kind:"pane"}}async function l(c,b,x,m,k,w,E,j){const v=r.current,f=(m?x.x-Fc:x.x)+j*28,I=(m?x.y-Bc:x.y)+j*28,p=c==="file"?k||Dr(w):"",A=await v.addNode({title:p,x:f,y:I,paramValues:[],kind:c}),F=await v.addMedia({nodeId:A.id,label:k,src:w,srcType:E,mediaType:b,showOnCard:!0});v.pushHistory({undo:()=>v.deleteNode(A.id),redo:()=>v.restoreNode({...A,media:[F]})})}async function d(c,b,x){const m=r.current;if(!m.enabled)return;const k=m.screenToFlowRef.current;if(!k)return;const w=Hd(c),E=i(b,x);try{w&&E.kind==="node"?await m.attachMedia({nodeId:E.id,label:"",src:c,srcType:"url",mediaType:w,showOnCard:!0}):w?await l(w,w,k({x:b,y:x}),E.kind==="region","",c,"url",0):await l("file","file",k({x:b,y:x}),E.kind==="region",Dr(c),c,"url",0)}catch{m.toast("Could not add dropped file",!1)}}function u(c){const b=c.dataTransfer;!b||b.types.includes("Files")||(b.types.includes("text/uri-list")||b.types.includes("text/plain"))&&(!r.current.enabled||!a(c.clientX,c.clientY)||(c.preventDefault(),s(!0)))}function g(c){if(c.dataTransfer?.types.includes("Files"))return;const b=Fd(c.dataTransfer);!b||!a(c.clientX,c.clientY)||(c.preventDefault(),s(!1),d(b,c.clientX,c.clientY))}const h=()=>s(!1);return document.addEventListener("dragover",u),document.addEventListener("drop",g),document.addEventListener("dragleave",h),document.addEventListener("dragend",h),()=>{document.removeEventListener("dragover",u),document.removeEventListener("drop",g),document.removeEventListener("dragleave",h),document.removeEventListener("dragend",h)}},[]),{dropActive:t}}function Uc({nodeIds:n,onSaveAll:r,onAutoWire:t}){const{activeParamDefs:s}=Se(),[a,i]=o.useState(!1),[l,d]=o.useState(""),[u,g]=o.useState(""),h=s.filter(x=>x.paramType==="select"||x.paramType==="select_color"),c=h.find(x=>x.id===l);async function b(){if(l){i(!0);try{await r(l,u||null)}finally{i(!1)}}}return e.jsxs("aside",{className:"detail-panel bulk-edit-panel",children:[e.jsxs("div",{className:"detail-panel__header",children:[e.jsx(ud,{size:14}),e.jsxs("h2",{children:[n.length," nodes selected"]})]}),e.jsx("div",{className:"detail-panel__body",children:h.length===0?e.jsx("p",{className:"form-hint",children:"No dropdown fields defined in this preset."}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Field"}),e.jsxs("select",{value:l,onChange:x=>{d(x.target.value),g("")},children:[e.jsx("option",{value:"",children:"— Choose field —"}),h.map(x=>e.jsx("option",{value:x.id,children:x.displayName},x.id))]})]}),c&&e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Set value"}),e.jsxs("select",{value:u,onChange:x=>g(x.target.value),children:[e.jsx("option",{value:"",children:"— Clear —"}),c.options.map(x=>e.jsx("option",{value:x.valueSlug,children:x.label},x.id))]})]}),e.jsxs("p",{className:"form-hint",children:["Applies the chosen value to all ",n.length," selected nodes. Other field values are unchanged."]})]})}),e.jsxs("div",{className:"detail-panel__footer",children:[t&&e.jsx("button",{className:"btn btn--ghost btn--sm",onClick:t,title:"Connect selected nodes in order (W)",children:"Auto-Wire"}),e.jsx("button",{className:"btn btn--primary",onClick:b,disabled:a||!l,children:a?"Applying…":`Apply to ${n.length} nodes`})]})]})}function Gc({nodes:n,onNodeClick:r}){const{getNodeColor:t}=Se(),s=o.useMemo(()=>n.filter(a=>a.eventDate).sort((a,i)=>a.eventDate<i.eventDate?-1:a.eventDate>i.eventDate?1:0),[n]);return s.length===0?e.jsx("div",{className:"timeline-panel timeline-panel--empty",children:e.jsx("span",{children:"No nodes with event dates to show"})}):e.jsx("div",{className:"timeline-panel",children:e.jsxs("div",{className:"timeline-track",children:[e.jsx("div",{className:"timeline-line"}),s.map(a=>e.jsxs("button",{className:"timeline-node",onClick:()=>r(a),title:`${a.eventDate} — ${a.title}`,children:[e.jsx("div",{className:"timeline-node__dot",style:{background:t(a)}}),e.jsxs("div",{className:"timeline-node__label",children:[e.jsx("span",{className:"timeline-node__date",children:a.eventDate}),e.jsx("span",{className:"timeline-node__title",children:a.title})]})]},a.id))]})})}function qc({onNewProject:n,onImport:r}){const{tabs:t,switchTab:s}=Ar(),[a,i]=o.useState([]),[l,d]=o.useState(null);o.useEffect(()=>{r0.getRecentProjects().then(i).catch(()=>{})},[]);const u=t.filter(m=>m.savePath);async function g(m){if(!(l||m.missing)){d(m.path);try{await r0.openPathAsTab(m.path)}catch{d(null)}}}async function h(m){if(!l){try{await r0.removeRecentProject(m.path)}catch{}i(k=>k.filter(w=>w.path!==m.path))}}async function c(m){if(l)return;const k=await Qn({});if(typeof k=="string"){d(m.path);try{await r0.openPathAsTab(k),await r0.removeRecentProject(m.path)}catch{d(null)}}}const b=a.length>0||u.length>0,x=a.filter(m=>m.missing&&!u.some(k=>k.savePath===m.path)).length;return e.jsx("div",{className:"start-screen",children:e.jsxs("div",{className:"start-screen__panel",children:[e.jsxs("div",{className:"start-screen__panel-header",children:[e.jsx(yt,{size:14,className:"start-screen__logo-mark"}),e.jsx("span",{className:"start-screen__panel-title",children:"GloGraph"})]}),e.jsxs("div",{className:"start-screen__body",children:[e.jsxs("section",{className:"start-screen__col",children:[e.jsx("div",{className:"start-screen__col-header",children:"Start"}),e.jsxs("div",{className:"start-screen__col-body",children:[e.jsxs("button",{className:"start-screen__btn start-screen__btn--primary",onClick:n,children:[e.jsx(oe,{size:13}),"New Project"]}),e.jsxs("button",{className:"start-screen__btn",onClick:r,children:[e.jsx(lt,{size:13}),"Open Project…"]})]})]}),e.jsx("div",{className:"start-screen__separator"}),e.jsxs("section",{className:"start-screen__col start-screen__col--recent",children:[e.jsx("div",{className:"start-screen__col-header",children:"Recent"}),e.jsxs("div",{className:"start-screen__col-body",children:[b?e.jsxs("ul",{className:"start-screen__recent-list",children:[u.map(m=>e.jsx("li",{children:e.jsxs("button",{className:"start-screen__recent-row start-screen__recent-row--open",onClick:()=>s(m.id),children:[e.jsx("span",{className:"start-screen__recent-dot"}),e.jsx("span",{className:"start-screen__recent-name",children:m.name}),e.jsx("span",{className:"start-screen__recent-path",children:m.savePath}),e.jsx(Le,{size:11,className:"start-screen__recent-chevron"})]})},m.id)),a.filter(m=>!u.some(k=>k.savePath===m.path)).map(m=>e.jsxs("li",{className:"start-screen__recent-li",children:[e.jsxs("button",{className:`start-screen__recent-row${l===m.path?" start-screen__recent-row--loading":""}${m.missing?" start-screen__recent-row--missing":""}`,onClick:()=>g(m),disabled:l!==null||m.missing,title:m.missing?`File not found: ${m.path}`:m.path,children:[e.jsx("span",{className:`start-screen__recent-dot start-screen__recent-dot--dim${m.missing?" start-screen__recent-dot--missing":""}`}),e.jsx("span",{className:"start-screen__recent-name",children:m.name}),m.missing?e.jsxs("span",{className:"start-screen__recent-badge",children:[e.jsx(qt,{size:10}),"Not found"]}):e.jsx("span",{className:"start-screen__recent-path",children:m.path}),!m.missing&&e.jsx(Le,{size:11,className:"start-screen__recent-chevron"})]}),e.jsxs("div",{className:`start-screen__recent-actions${m.missing?" start-screen__recent-actions--missing":""}`,children:[m.missing&&e.jsx("button",{className:"start-screen__recent-action",onClick:()=>c(m),disabled:l!==null,title:"Locate the moved file","aria-label":"Locate the moved file",children:e.jsx(_i,{size:12})}),e.jsx("button",{className:"start-screen__recent-action",onClick:()=>h(m),disabled:l!==null,title:"Remove from recents","aria-label":"Remove from recents",children:e.jsx(S0,{size:12})})]})]},m.path))]}):e.jsx("span",{className:"start-screen__empty",children:"No recent projects"}),x>0&&e.jsxs("div",{className:"start-screen__recent-missing-note",children:[e.jsx(qt,{size:11}),x===1?"1 recent project could not be found (moved or deleted).":`${x} recent projects could not be found (moved or deleted).`]})]})]})]})]})})}const bs=o.createContext(null);function Kc({children:n}){const[r,t]=o.useState(null);return e.jsx(bs.Provider,{value:{session:r,setSession:t},children:n})}function xs(){const n=o.useContext(bs);if(!n)throw new Error("useSession must be used inside SessionProvider");return n}function vs(n){if(n?.role!=="guest"||!n.localBase||!n.token)return null;const r=n.localBase.trim().replace(/\/+$/,""),t=n.token,s=r.replace(/^http/,"ws");return{base:r,ws:`${s}/ws?token=${encodeURIComponent(t)}`,token:t}}function Zc(n,r){const t={Authorization:`Bearer ${r}`},s={"Content-Type":"application/json",...t},a=c=>Promise.reject(new Error(`${c} isn't available in a shared session.`));async function i(c,b,x){const m=await fetch(`${n}${b}`,{method:c,headers:x===void 0?t:s,body:x===void 0?void 0:JSON.stringify(x)});if(!m.ok)throw new Error(`${c} ${b} → HTTP ${m.status}`);const k=await m.text();return k?JSON.parse(k):void 0}let l=null;function d(){const c=Date.now();return(!l||c-l.at>50)&&(l={at:c,p:i("GET","/api/graph")}),l.p}const u=encodeURIComponent,g=c=>{const b=/\.([a-z0-9]+)$/i.exec(c);return b?b[1]:""};async function h(c,b){const x=await r0.readLocalFile(c),m=await fetch(`${n}${b}`,{method:"POST",headers:{...t,"Content-Type":"application/octet-stream"},body:new Uint8Array(x)});if(!m.ok)throw new Error(`media upload → HTTP ${m.status}`);return m.json()}return{getAllNodes:()=>d().then(c=>c.nodes),getAllEdges:()=>d().then(c=>c.edges),getAllRegions:()=>d().then(c=>c.regions),createNode:c=>i("POST","/api/nodes",c),updateNode:c=>i("PATCH",`/api/nodes/${u(c.id)}`,c),deleteNode:c=>i("DELETE",`/api/nodes/${u(c)}`),updateNodePositions:c=>i("PATCH","/api/nodes/batch-positions",c.map(b=>({id:b.id,x:b.x,y:b.y}))),setNodePinned:(c,b)=>i("PATCH",`/api/nodes/${u(c)}`,{isPinned:b}),setNodeExpandPinned:(c,b)=>i("PATCH",`/api/nodes/${u(c)}`,{isExpandPinned:b}),setNodeZOrder:(c,b)=>i("PATCH",`/api/nodes/${u(c)}`,{zOrder:b}),setNodeSize:(c,b,x)=>i("PATCH",`/api/nodes/${u(c)}`,{width:b,height:x}),setNodeRenderMarkdown:(c,b)=>i("PATCH",`/api/nodes/${u(c)}`,{renderMarkdown:b}),setNodeShowThumbnail:(c,b)=>i("PATCH",`/api/nodes/${u(c)}`,{showThumbnail:b}),restoreNode:c=>i("POST","/api/nodes/restore",c),addNodeLink:c=>i("POST",`/api/nodes/${u(c.nodeId)}/links`,{url:c.url,label:c.label??null}),deleteNodeLink:c=>i("DELETE",`/api/links/${u(c)}`),addNodeMedia:c=>{if(c.srcType==="file"){const b=new URLSearchParams({label:c.label??"",mediaType:c.mediaType,showOnCard:String(c.showOnCard??!0),ext:g(c.src)});return h(c.src,`/api/nodes/${u(c.nodeId)}/media/file?${b.toString()}`)}return i("POST",`/api/nodes/${u(c.nodeId)}/media`,{label:c.label??"",src:c.src,srcType:"url",mediaType:c.mediaType,showOnCard:c.showOnCard??!0})},updateNodeMedia:async(c,b,x,m)=>m==="file"?(await h(x,`/api/media/${u(c)}/file?ext=${u(g(x))}`),i("PATCH",`/api/media/${u(c)}`,{label:b})):i("PATCH",`/api/media/${u(c)}`,{label:b,src:x,srcType:"url"}),updateNodeMediaShowOnCard:(c,b)=>i("PATCH",`/api/media/${u(c)}`,{showOnCard:b}),updateNodeMediaSortOrder:(c,b)=>i("PATCH",`/api/media/${u(c)}`,{sortOrder:b}),deleteNodeMedia:c=>i("DELETE",`/api/media/${u(c)}`),createEdge:c=>i("POST","/api/edges",c),updateEdge:c=>i("PATCH",`/api/edges/${u(c.id)}`,c),reconnectEdge:(c,b,x,m,k)=>i("PATCH",`/api/edges/${u(c)}`,{sourceId:b,targetId:x,sourceHandle:m??null,targetHandle:k??null}),deleteEdge:c=>i("DELETE",`/api/edges/${u(c)}`),updateEdgeWaypoints:()=>a("Edge waypoints"),restoreEdge:c=>i("POST","/api/edges/restore",c),createRegion:c=>i("POST","/api/regions",c),updateRegion:c=>i("PATCH",`/api/regions/${u(c.id)}`,c),deleteRegion:c=>i("DELETE",`/api/regions/${u(c)}`),setRegionZOrder:(c,b)=>i("PATCH",`/api/regions/${u(c)}`,{zOrder:b}),setRegionLocked:(c,b)=>i("PATCH",`/api/regions/${u(c)}`,{isLocked:b}),setRegionMinimized:(c,b)=>i("PATCH",`/api/regions/${u(c)}`,{isMinimized:b}),restoreRegion:c=>i("POST","/api/regions/restore",c)}}const Ea=Xe/2,Da=en/2,Jc="0.9.13";function Ta(){const{session:n,setSession:r}=xs(),t=vs(n),s=!!t,a=s&&n?.access==="read-only",i=o.useMemo(()=>t?Zc(t.base,t.token):void 0,[t?.base,t?.token]),l=i??r0,d=Sd(i,!!i),u=Ed(),[g,h]=o.useState(0),c=o.useRef(null);o.useEffect(()=>{const Q=$a("api:graph-changed",()=>{c.current==null&&(c.current=setTimeout(()=>{c.current=null,d.reload().then(()=>h(u0=>u0+1))},100))});return()=>{c.current!=null&&(clearTimeout(c.current),c.current=null),Q.then(u0=>u0())}},[d.reload]);const b=o.useRef(!1),x=o.useRef(null);o.useEffect(()=>{if(!s){if(!b.current){b.current=!0;return}return x.current!=null&&clearTimeout(x.current),x.current=setTimeout(()=>{x.current=null,r0.publishChange().catch(()=>{})},60),()=>{x.current!=null&&(clearTimeout(x.current),x.current=null)}}},[d.nodes,d.edges,d.regions,s]),o.useEffect(()=>{if(!t)return;const N=new EventSource(`${t.base}/api/events?token=${encodeURIComponent(t.token)}`);let Q=null;return N.onmessage=()=>{Q==null&&(Q=setTimeout(()=>{Q=null,d.reload().then(()=>h(u0=>u0+1))},40))},()=>{N.close(),Q!=null&&clearTimeout(Q)}},[t?.base,t?.token,d.reload]),o.useEffect(()=>(Xt(t?t.base:null,t?.token??""),()=>Xt(null)),[t?.base,t?.token]);const{activeParamDefs:m,activeEdgeParamDefs:k,edgeRoutingMode:w,setEdgeRoutingMode:E,expandNodesByDefault:j,setExpandNodesByDefault:v}=Se(),f=Ar(),[I,p]=o.useState({kind:"none"}),[A,F]=o.useState(),[Z,H]=o.useState(),[J,C]=o.useState(),[z,L]=o.useState(new Set),[P,W]=o.useState(new Set),[_,a0]=o.useState(null),[c0,B]=o.useState(0),[S,E0]=o.useState(!1),[Y0,A0]=o.useState("presets"),[I0,q0]=o.useState(!1),[W0,H0]=o.useState(null),[U0,F0]=o.useState(!1),[M0,M]=o.useState(f.activeTab?.savePath??null),[O,$]=o.useState(null),[V,d0]=o.useState(0),[m0,R0]=o.useState(0),[J0,g0]=o.useState(0),[N0,O0]=o.useState(0),[Q0,X0]=o.useState(!1),[ee,B0]=o.useState(new Set),[y0,D]=o.useState(new Set),[i0,n0]=o.useState(new Map),[C0,P0]=o.useState(new Set),[_0,D0]=o.useState(null),{traceSeedId:G,trace:h0,traceNodeIds:L0,traceEdgeIds:ne,handleTrace:Ee,clearTrace:De,setTraceDirection:Ue}=Jl(d.nodes,d.edges,()=>P0(new Set)),[K0,z0]=o.useState(!1),[He,re]=o.useState(!1),ue=o.useCallback(async()=>{if(n?.role==="host")try{await r0.stopHostSession()}catch{}try{await r0.stopGuestBridge()}catch{}r(null)},[n,r]);o.useEffect(()=>{if(!t)return;let N=0,Q=!1;const u0=setInterval(async()=>{try{N=(await fetch(`${t.base}/api/ping`,{headers:{Authorization:`Bearer ${t.token}`}})).ok?0:N+1}catch{N+=1}N>=3&&!Q&&(Q=!0,clearInterval(u0),$({msg:"The host ended the session.",ok:!1}),setTimeout(()=>$(null),5e3),ue())},3e3);return()=>clearInterval(u0)},[t?.base,t?.token,ue]);const ge=!!n,be=n?.localBase?`${n.localBase.replace(/^http/,"ws")}/ws?token=${encodeURIComponent(n.token??"")}`:"",[$0,ye]=o.useState([]),y=o.useMemo(()=>{const N=new Set($0);return A&&N.add(A),Z&&N.add(Z),J&&N.add(J),Array.from(N)},[$0,A,Z,J]),Y=o.useRef(null),t0=o.useRef(!1),[K,k0]=o.useState(null),b0=o.useRef({x:0,y:0,zoom:1}),{bookmarks:we,saveBookmarks:dn,handleSaveBookmark:ln,handleDeleteBookmark:cn,handleRestoreBookmark:Ge,targetViewport:X,clearTargetViewport:p0}=ac({viewportRef:b0,markDirty:Pe}),G0=o.useRef(null),[ie,te]=o.useState(1),[qe,de]=o.useState(""),ke=o.useRef(null),[$r,rr]=o.useState(0),[tr,Bn]=o.useState(0),[ar,sr]=o.useState(!1),[or,Wn]=o.useState(!1),[In,un]=o.useState(null),_e=o.useRef([]),Cn=o.useRef(null);o.useEffect(()=>{r0.getAppSetting("graph_notes").then(N=>{N&&de(N)})},[]),o.useEffect(()=>{r0.getBuildInfo().then(H0).catch(()=>{})},[]);const Un=o.useRef(!1);function Gn(){B0(new Set(d.nodes.filter(N=>N.isPinned).map(N=>N.id))),D(new Set(d.nodes.filter(N=>N.isExpandPinned).map(N=>N.id))),W(new Set(d.regions.filter(N=>N.isLocked).map(N=>N.id))),L(new Set(d.regions.filter(N=>N.isMinimized).map(N=>N.id)))}o.useEffect(()=>{d.loading||Un.current||(Un.current=!0,Gn())},[d.loading,d.nodes,d.regions]),o.useEffect(()=>{g===0||d.loading||(Gn(),mn())},[g]);const pn=o.useRef(null);function mn(){s||(pn.current!=null&&clearTimeout(pn.current),pn.current=setTimeout(()=>{pn.current=null,f.recomputeActiveTabDirty().catch(()=>{})},400))}function Pe(){if(s)return;const N=f.activeTab?.id;N&&(f.activeTab?.dirty||f.markTabDirty(N),mn())}o.useEffect(()=>{d.mutationSeq>0&&Pe()},[d.mutationSeq]);function ir(N){de(N),ke.current&&clearTimeout(ke.current),ke.current=setTimeout(()=>{r0.setAppSetting("graph_notes",N)},250),Pe()}const fe=o.useRef({nodeIds:[],edgeIds:[]}),j0=o.useRef({}),{clipboardRef:Re,buildClipboardPayload:fn,handlePaste:qn}=nc({graph:d,gapi:l,history:u,keyStateRef:j0,rfSelectionRef:fe,setPinnedNodeIds:B0,setPinnedExpandIds:D,setLockedRegionIds:W,setMinimizedRegionIds:L,applyRegionLock:Rn,applyRegionMinimize:he,suppressRegionHistoryRef:t0}),{handleCreateItem:dr,handleInlineNoteChange:Lr,handleToggleRenderMarkdown:lr,handleToggleShowThumbnail:cr,handleNodeResize:ur,handleAddMedia:Fe,handleRemoveMedia:Sn,handleReorderMedia:En,handleAddLink:pr,handleRemoveLink:Dn,handleNodeBringToFront:Tn,handleNodeSendToBack:Mn,handleSaveNode:mr,handleDeleteNode:Vr,handleDeleteMultiple:On,handleNodeMove:Hr,handleQuickConnect:Fr}=ic({graph:d,history:u,readOnly:a,activeEdgeParamDefs:k,quickConnectSourceId:K,setQuickConnectSourceId:k0,setPanel:p,setSelectedNodeId:F,setSelectedEdgeId:H,setSelectedRegionId:C,setScrollToPos:a0});function fr(N){const Q=fe.current.nodeIds;return Q.includes(N)&&Q.length>1?Q:[N]}function Br(N){const Q=fn(fr(N));Q&&qn(Q)}function Kn(N){On(fr(N),[])}function Wr(N){const Q=fn([N]);Q&&qn(Q)}const{dropActive:Ur}=Wc({enabled:!a,screenToFlowRef:G0,nodes:d.nodes,regions:d.regions,addNode:d.addNode,addMedia:d.addMedia,attachMedia:Fe,deleteNode:d.deleteNode,restoreNode:d.restoreNode,pushHistory:u.push,toast:(N,Q)=>$({msg:N,ok:Q})});function Zn(){const N=document.querySelector(".graph-canvas"),Q=G0.current;if(N&&Q){const w0=N.getBoundingClientRect(),Z0=Q({x:w0.left+w0.width/2,y:w0.top+w0.height/2});return{x:Z0.x-Ea,y:Z0.y-Da}}let u0=0,f0=0;return d.nodes.length>0&&(u0=d.nodes.reduce((w0,Z0)=>w0+Z0.x,0)/d.nodes.length,f0=d.nodes.reduce((w0,Z0)=>w0+Z0.y,0)/d.nodes.length),{x:u0,y:f0}}function hr(){a||(p({kind:"createNode",pos:Zn()}),F(void 0),H(void 0),C(void 0))}function Gr(){a||un({screen:{x:window.innerWidth/2,y:window.innerHeight/2},flow:Zn()})}function qr(N){const Q=In;if(un(null),!Q||a)return;const u0=Q.regionId?{x:Q.flow.x-Ea,y:Q.flow.y-Da}:Q.flow;N==="standard"?(p({kind:"createNode",pos:u0}),F(void 0),H(void 0),C(void 0)):dr(N,u0)}function T(){let N=0,Q=0;d.nodes.length>0&&(N=d.nodes.reduce((u0,f0)=>u0+f0.x,0)/d.nodes.length,Q=d.nodes.reduce((u0,f0)=>u0+f0.y,0)/d.nodes.length),p({kind:"createRegion",pos:{x:N-160,y:Q-110}}),F(void 0),H(void 0),C(void 0)}function R(N){a||(p({kind:"createNode",pos:N}),F(void 0),H(void 0),C(void 0))}function U(N){dr(N,Zn())}function q(N){a||(p({kind:"createRegion",pos:N}),F(void 0),H(void 0),C(void 0))}function o0(N){if(!N){F(void 0);return}F(N.id),H(void 0),C(void 0),p({kind:"editNode",node:N})}function x0(N){if(!N){H(void 0);return}H(N.id),F(void 0),C(void 0),p({kind:"editEdge",edge:N})}function ae(N){if(!N){C(void 0);return}C(N.id),F(void 0),H(void 0),p({kind:"editRegion",region:N})}function T0(N){p({kind:"editNode",node:N}),F(N.id)}function pe(N){Y.current&&clearTimeout(Y.current),D0(N),Y.current=setTimeout(()=>D0(null),1200)}function se(N){p({kind:"editNode",node:N}),F(N.id),C(void 0),a0({x:N.x,y:N.y}),pe(N.id)}function je(N){p({kind:"editRegion",region:N}),C(N.id),F(void 0),H(void 0),a0({x:N.x+N.width/2,y:N.y+N.height/2})}function Pn(){I.kind!=="none"&&(F(void 0),H(void 0),C(void 0),p({kind:"none"}))}function v0(N,Q){fe.current={nodeIds:N,edgeIds:Q},rr(N.length),ye(w0=>{const Z0=[...N,...Q];return w0.length===Z0.length&&Z0.every(Ie=>w0.includes(Ie))?w0:Z0});const u0=Cn.current;(N.length>1&&u0&&(Math.abs(u0.dx)>10||Math.abs(u0.dy)>10)||N.length===0)&&(_e.current=[],Bn(0))}function V0(N,Q){L(u0=>{const f0=new Set(u0);return Q?f0.add(N):f0.delete(N),f0}),l.setRegionMinimized(N,Q).catch(()=>{})}function xe(N,Q){W(u0=>{const f0=new Set(u0);return Q?f0.add(N):f0.delete(N),f0}),l.setRegionLocked(N,Q).catch(()=>{})}function he(N,Q){const u0=z.has(N);V0(N,Q),Pe(),!t0.current&&u0!==Q&&u.push({undo:async()=>{V0(N,u0)},redo:async()=>{V0(N,Q)}})}function Rn(N,Q){const u0=P.has(N);xe(N,Q),Pe(),!t0.current&&u0!==Q&&u.push({undo:async()=>{xe(N,u0)},redo:async()=>{xe(N,Q)}})}const{handleRegionMove:Be,handleRegionResize:nn,handleRegionBringToFront:ze,handleRegionSendToBack:Kr,handleSaveRegion:ws,handleDeleteRegion:Zr,handleWrapSelectionInRegion:ks,handleRegionAutoFit:js}=sc({graph:d,history:u,readOnly:a,selectedNodeId:A,rfSelectionRef:fe,setPanel:p,setSelectedNodeId:F,setSelectedEdgeId:H,setSelectedRegionId:C,setScrollToPos:a0,setMinimizedRegionIds:L,setLockedRegionIds:W}),{handleConnect:Ns,handleDeleteEdge:kt,handleFlipEdge:_s,handleEdgeReconnect:Is,handleSaveEdge:Cs,handleEdgeLabelChange:Ss,handleEdgeWaypointsChange:Es}=oc({graph:d,history:u,readOnly:a,activeEdgeParamDefs:k,setPanel:p,setSelectedNodeId:F,setSelectedEdgeId:H,setSelectedRegionId:C}),{openSaveDialog:jt,triggerSave:Nt,handleOpenProject:_t}=tc({currentSavePath:M0,setCurrentSavePath:M,activeTab:f.activeTab,markTabClean:f.markTabClean,setTabSavePath:f.setTabSavePath,renameTab:f.renameTab,setSaveToast:$}),{handleAutoWire:It,handleAutoLayout:Ct}=lc({graph:d,history:u,readOnly:a,activeEdgeParamDefs:k,orderedSelectionRef:_e,rfSelectionRef:fe,dragVectorRef:Cn,lockedRegionIds:P,setFitViewTrigger:d0}),St=o.useRef(we);St.current=we;const Et=o.useRef(dn);Et.current=dn,j0.current.selectedNodeId=A,j0.current.selectedEdgeId=Z,j0.current.selectedRegionId=J,j0.current.nodes=d.nodes,j0.current.edges=d.edges,j0.current.regions=d.regions,j0.current.openCreatePicker=Gr,j0.current.handleDeleteMultiple=On,j0.current.handleDeleteRegion=Zr,j0.current.handlePaste=qn,j0.current.pinnedNodeIds=ee,j0.current.pinnedExpandIds=y0,j0.current.toggleExpand=zs,j0.current.lockedRegionIds=P,j0.current.minimizedRegionIds=z,j0.current.triggerSave=Nt,j0.current.openSaveAs=jt,j0.current.openNewTab=()=>F0(!0),j0.current.closeActiveTab=()=>{if(f.tabs.length<=1)return;const N=f.activeTab;N&&(N.dirty?f.requestCloseTab(N.id):f.closeTab(N.id,!N.savePath))},j0.current.openProject=_t,j0.current.undo=u.undo,j0.current.redo=u.redo,j0.current.cycleRoutingMode=()=>{const N=["bezier","waypoints","orthogonal"],Q=N.indexOf(w);E(N[(Q+1)%N.length])},j0.current.openQuickFind=()=>Wn(!0),j0.current.autoWire=It,j0.current.readOnly=a,Yl({keyStateRef:j0,rfSelectionRef:fe,orderedSelectionRef:_e,clipboardRef:Re,viewportRef:b0,bookmarksRef:St,saveBookmarksRef:Et,setPanel:p,setSelectedNodeId:F,setSelectedEdgeId:H,setSelectedRegionId:C,setSearchFocusTrigger:B,setSelectAllTrigger:R0,setSelectRegionTrigger:O0,setZoomToSelectionTrigger:g0,setFocusMode:X0,setQuickConnectSourceId:k0,clearTrace:De,buildClipboardPayload:fn});const{handleExportCsv:Ds,handleExportPng:Ts,handleExportMermaid:Ms,handleExportDot:Os}=rc({nodes:d.nodes,edges:d.edges,activeParamDefs:m,projectName:f.activeTab?.name,setSaveToast:$});function Dt(N){P0(N.length>0?new Set(N):new Set)}function Ps(N){const Q=new Set([N]);d.edges.forEach(u0=>{u0.sourceId===N&&Q.add(u0.targetId),u0.targetId===N&&Q.add(u0.sourceId)}),Dt([...Q])}function Tt(N){const Q=!ee.has(N);B0(u0=>{const f0=new Set(u0);return f0.has(N)?f0.delete(N):f0.add(N),f0}),l.setNodePinned(N,Q).catch(()=>{}),Pe()}function Rs(N){const Q=!y0.has(N);D(u0=>{const f0=new Set(u0);return f0.has(N)?f0.delete(N):f0.add(N),f0}),l.setNodeExpandPinned(N,Q).catch(()=>{}),Pe()}function zs(){const N=fe.current,Q=N.nodeIds.length?N.nodeIds:A?[A]:[];if(!Q.length){v(!j),n0(new Map);return}const u0=w0=>{const Z0=i0.get(w0);return Z0!==void 0?Z0:y0.has(w0)||j},f0=Q.some(w0=>!u0(w0));n0(w0=>{const Z0=new Map(w0);return Q.forEach(Ie=>Z0.set(Ie,f0)),Z0})}function As(){const N=!!(fe.current.nodeIds.length||fe.current.edgeIds.length||A||Z||J),Q=!!(fe.current.nodeIds.length||A),u0=!!(Re.current?.nodes.length||Re.current?.regions.length);return[{label:"File",items:[{label:"New Project",shortcut:"Ctrl+N",action:()=>F0(!0)},{label:"Close Tab",shortcut:"Ctrl+W",action:()=>j0.current.closeActiveTab?.(),disabled:f.tabs.length<=1},{sep:!0},{label:M0?"Save":"Save…",shortcut:"Ctrl+S",action:Nt},{label:"Save As…",shortcut:"Ctrl+Shift+S",action:jt},{label:"Open Project…",shortcut:"Ctrl+O",action:_t},{sep:!0},{label:"Export as PNG…",action:Ts},{label:"Export as CSV…",action:Ds,disabled:!d.nodes.length},{label:"Copy as Mermaid",action:Ms,disabled:!d.nodes.length},{label:"Copy as DOT (Graphviz)",action:Os,disabled:!d.nodes.length}]},{label:"Graph Objects",items:[{label:"Add Node",shortcut:"N",action:hr,icon:e.jsx(oe,{size:13})},{sep:!0},{label:"Add Note",action:()=>U("note"),icon:e.jsx(ht,{size:13})},{label:"Add Image",action:()=>U("image"),icon:e.jsx(Je,{size:13})},{label:"Add Video",action:()=>U("video"),icon:e.jsx(on,{size:13})},{label:"Add Audio",action:()=>U("audio"),icon:e.jsx(wn,{size:13})},{label:"Add File",action:()=>U("file"),icon:e.jsx(Xn,{size:13})},{sep:!0},{label:"Add Region",action:T,icon:e.jsx(Ya,{size:13})},{label:"Wrap Selection in Region",action:Q?ks:void 0,disabled:!Q}]},{label:"Edit",items:[{label:"Copy",shortcut:"Ctrl+C",action:N?()=>{const f0=fn();f0&&(Re.current=f0)}:void 0,disabled:!N},{label:"Paste",shortcut:"Ctrl+V",action:u0?()=>{const f0=Re.current;f0&&(f0.nodes.length||f0.regions.length)&&j0.current.handlePaste?.(f0)}:void 0,disabled:!u0},{label:"Duplicate",shortcut:"Ctrl+D",action:N?()=>{const f0=fn();f0&&j0.current.handlePaste?.(f0)}:void 0,disabled:!N},{sep:!0},{label:"Auto Layout ↕",action:()=>Ct("TB"),disabled:!d.nodes.length},{label:"Auto Layout ↔",action:()=>Ct("LR"),disabled:!d.nodes.length},{label:"Zoom to Selection",shortcut:"Ctrl+Shift+F",action:N?()=>g0(f0=>f0+1):void 0,disabled:!N},{sep:!0},{label:"Delete Selected",shortcut:"Del",action:N?()=>{const{selectedNodeId:f0,selectedEdgeId:w0,selectedRegionId:Z0,nodes:Ie,edges:Mt,regions:$s,handleDeleteMultiple:Ls,handleDeleteRegion:Vs}=j0.current,gr=fe.current,Hs=gr.nodeIds.length?gr.nodeIds:[...f0?[f0]:[],...Z0?[Z0]:[]],Ot=gr.edgeIds.length?gr.edgeIds:w0?[w0]:[],{nodeIds:Pt,regionIds:Fs}=bt({edges:Mt,regions:$s},Hs);(Pt.length||Ot.length)&&Ls?.(Pt,Ot);for(const Bs of Fs)Vs?.(Bs)}:void 0,disabled:!N}]},{label:"Share",items:[{label:"Host Session… (desktop app)",action:void 0,disabled:!0},{label:"Join Session… (desktop app)",action:void 0,disabled:!0}]},{label:"Preferences",items:[{label:"Graph Settings…",action:()=>{A0("presets"),E0(!0)}},{label:"Keyboard Shortcuts…",action:()=>{A0("shortcuts"),E0(!0)}},{sep:!0},{label:"About GloGraph",action:()=>q0(!0)}]}]}return d.loading?e.jsx("div",{className:"app-loading",children:e.jsx("span",{children:"Loading GloGraph…"})}):d.loadError?e.jsx("div",{className:"app-loading app-loading--error",children:e.jsxs("span",{children:["Failed to load graph data: ",d.loadError]})}):e.jsx(bl,{enabled:ge&&!!be,wsUrl:be,name:n?.name??"User",selection:y,children:e.jsxs("div",{className:`app${Q0?" app--focus":""}`,children:[e.jsx(Dc,{nodes:d.nodes,edges:d.edges,regions:d.regions,selectedNodeId:A,selectedRegionId:J,onSelectNode:se,onSelectRegion:je,onHighlight:Dt,onScrollToNode:se,searchFocusTrigger:c0,graphNotes:qe,onNotesChange:ir}),e.jsxs("div",{className:"app__main",children:[e.jsx(Nc,{menus:As(),quickActions:e.jsxs("button",{className:"btn btn--ghost btn--sm",onClick:()=>sr(N=>!N),title:"Toggle timeline",children:[e.jsx(ci,{size:13})," Timeline"]}),stat:[`${d.nodes.length} nodes`,`${d.regions.length} regions`,`${d.edges.length} edges`,...u.undoCount>0?[`↩ ${u.undoCount}`]:[]].join(" · ")}),!s&&e.jsx(jc,{onNewTab:()=>F0(!0)}),e.jsx(Tc,{bookmarks:we,onRestore:Ge,onSave:ln,onDelete:cn}),e.jsxs("div",{className:"canvas-region",children:[e.jsx(Fl,{nodes:d.nodes,edges:d.edges,regions:d.regions,minimizedRegionIds:z,lockedRegionIds:P,selectedNodeId:A,selectedEdgeId:Z,selectedRegionId:J,onNodeSelect:o0,onEdgeSelect:x0,onRegionSelect:ae,onConnect:Ns,onEdgeReconnect:Is,onEdgeDelete:kt,onEdgeWaypointsChange:Es,onEdgeLabelChange:Ss,onNodeMove:Hr,onNodeDoubleClick:T0,onRegionMinimize:he,onRegionLock:Rn,onRegionMove:Be,onRegionResize:nn,onPaneClick:Pn,readOnly:a,onPaneDoubleClick:R,onViewportChange:te,onFindRelated:Ps,onTrace:Ee,traceNodeIds:L0,traceEdgeIds:ne,traceSeedId:G,onNodeBringToFront:Tn,onNodeSendToBack:Mn,onNodeDuplicate:a?void 0:Br,onNodeDelete:a?void 0:Kn,onContextMenuCreateRegion:q,onOpenCreatePicker:(N,Q,u0)=>{a||un({screen:N,flow:Q,regionId:u0})},onSelectionChange:v0,onMultiSelectionOrderChange:N=>{_e.current=N,Bn(N.length)},onSelectionDragVector:(N,Q)=>{Cn.current={dx:N,dy:Q}},scrollToPos:_,onScrolled:()=>a0(null),fitViewTrigger:V,selectAllTrigger:m0,zoomToSelectionTrigger:J0,viewportRef:b0,screenToFlowRef:G0,targetViewport:X,onTargetViewportConsumed:p0,highlightedNodeIds:C0,flashingNodeId:_0,onRegionEdit:N=>{const Q=d.regions.find(u0=>u0.id===N);Q&&ae(Q)},onRegionDelete:Zr,onRegionDuplicate:a?void 0:Wr,onRegionBringToFront:ze,onRegionSendToBack:Kr,selectRegionTrigger:N0,pinnedNodeIds:ee,pinnedExpandIds:y0,expandOverrides:i0,onTogglePinnedExpand:Rs,onTogglePin:Tt,onNoteChange:Lr,onToggleRenderMarkdown:lr,onToggleShowThumbnail:cr,onNodeResize:ur,inSession:ge}),h0&&(()=>{const N=d.nodes.find(Q=>Q.id===h0.seedId);return N?e.jsx(Bl,{seedLabel:me(N),direction:h0.direction,reachedCount:h0.reachedCount,maxHop:h0.maxHop,onSetDirection:Ue,onExit:De}):null})(),Ur&&e.jsx("div",{className:"canvas-drop-overlay",children:e.jsx("div",{className:"canvas-drop-overlay__label",children:"Drop image, video, or audio to add"})})]}),n&&e.jsxs("div",{className:"host-banner",role:"status",children:[e.jsx("span",{className:"host-banner__dot","aria-hidden":!0}),e.jsx("span",{className:"host-banner__text",children:n.role==="host"?e.jsxs(e.Fragment,{children:["Hosting as ",e.jsx("strong",{children:n.name}),n.token?e.jsxs(e.Fragment,{children:[" · code ",e.jsx("code",{className:"host-banner__code",children:n.token})]}):null]}):e.jsxs(e.Fragment,{children:["Joined ",e.jsx("strong",{children:n.address})," as ",e.jsx("strong",{children:n.name})]})}),n.access&&e.jsx("span",{className:`host-banner__access host-banner__access--${n.access==="editor"?"editor":"view"}`,children:n.role==="host"?n.access==="editor"?"Guests: Editor":"Guests: View only":n.access==="editor"?"Editing":"View only"}),e.jsx(Kl,{meLabel:n.name,onJumpTo:(N,Q)=>a0({x:N,y:Q})}),e.jsx("button",{className:"host-banner__stop",onClick:()=>{ue()},children:n.role==="host"?"Stop":"Leave"})]}),ge&&e.jsx(Zl,{}),e.jsx(Mc,{nodeCount:d.nodes.length,edgeCount:d.edges.length,regionCount:d.regions.length,savePath:M0,undoCount:u.undoCount,zoom:ie}),ar&&e.jsx(Gc,{nodes:d.nodes,onNodeClick:se})]}),(I.kind==="createNode"||I.kind==="editNode")&&e.jsx(Ic,{node:I.kind==="editNode"?I.node:void 0,defaultPosition:I.kind==="createNode"?I.pos:void 0,onClose:()=>p({kind:"none"}),onSave:mr,onDelete:Vr,onAddLink:pr,onRemoveLink:Dn,onAddMedia:Fe,onUpdateMedia:a?void 0:d.updateMedia,onUpdateMediaShowOnCard:a?void 0:d.updateMediaShowOnCard,onReorderMedia:En,onRemoveMedia:Sn,edges:d.edges,allNodes:d.nodes,onNavigateToNode:se,isPinned:I.kind==="editNode"?ee.has(I.node.id):void 0,onTogglePin:I.kind==="editNode"?()=>Tt(I.node.id):void 0,readOnly:a}),I.kind==="editEdge"&&e.jsx(Cc,{edge:I.edge,nodes:d.nodes,onClose:()=>p({kind:"none"}),onSave:Cs,onDelete:kt,onFlipEdge:_s,onSelectNode:se,readOnly:a}),(I.kind==="createRegion"||I.kind==="editRegion")&&e.jsx(Ec,{region:I.kind==="editRegion"?I.region:void 0,nodes:d.nodes,defaultPosition:I.kind==="createRegion"?I.pos:void 0,onClose:()=>p({kind:"none"}),onSave:ws,onDelete:Zr,onAutoFit:js,readOnly:a}),($r>1||tr>1)&&I.kind==="none"&&e.jsx(Uc,{nodeIds:_e.current.length>1?_e.current:fe.current.nodeIds,onSaveAll:async(N,Q)=>{const u0=_e.current.length>1?_e.current:fe.current.nodeIds,f0=d.nodes.filter(w0=>u0.includes(w0.id));await Promise.all(f0.map(w0=>{const Z0={id:w0.id,title:w0.title,description:w0.description,eventDate:w0.eventDate,x:w0.x,y:w0.y,color:w0.color,confidence:w0.confidence,impactMagnitude:w0.impactMagnitude,paramValues:w0.paramValues.map(Ie=>({paramDefId:Ie.paramDefId,value:Ie.paramDefId===N?Q:Ie.value??null,isEnabled:Ie.isEnabled,showOnCard:Ie.showOnCard}))};return d.updateNode(Z0)}))},onAutoWire:It}),K&&(()=>{const N=d.nodes.find(Q=>Q.id===K);return N?e.jsx(Oc,{sourceTitle:N.title,onConfirm:Fr,onCancel:()=>k0(null)}):null})(),or&&e.jsx(Pc,{nodes:d.nodes,onSelect:se,onClose:()=>Wn(!1)}),In&&e.jsx(Rc,{pos:In.screen,onPick:qr,onClose:()=>un(null)}),e.jsx(Hc,{}),S&&e.jsx(uc,{nodeCount:d.nodes.length,initialTab:Y0,onClose:()=>E0(!1)}),K0&&e.jsx(Gl,{onConfirm:async N=>{z0(!1);let Q;try{Q=await r0.startGuestBridge("127.0.0.1:57400",N.fingerprint)}catch{}r({role:"host",name:N.name,token:N.token,access:N.role,fingerprint:N.fingerprint,localBase:Q})},onCancel:()=>z0(!1)}),He&&e.jsx(ql,{onConfirm:async N=>{re(!1);const Q=N.address.indexOf("#"),u0=(Q>=0?N.address.slice(0,Q):N.address).trim(),f0=Q>=0?N.address.slice(Q+1).trim():"";try{const w0=await r0.startGuestBridge(u0,f0);let Z0="read-only";try{const Ie=await fetch(`${w0}/api/session?token=${encodeURIComponent(N.token)}`);Ie.ok&&(await Ie.json()).role==="editor"&&(Z0="editor")}catch{}r({role:"guest",name:N.name,address:u0,token:N.token,fingerprint:f0,localBase:w0,access:Z0})}catch(w0){$({msg:`Couldn't connect securely: ${w0}`,ok:!1}),setTimeout(()=>$(null),4e3)}},onCancel:()=>re(!1)}),I0&&e.jsx(Nn,{title:"About GloGraph",size:"sm",onClose:()=>q0(!1),children:e.jsxs("div",{className:"modal-body about-body",children:[e.jsx(yt,{size:40,className:"about-body__mark"}),e.jsx("span",{className:"about-body__name",children:"GloGraph"}),e.jsxs("span",{className:"about-body__version",children:["Version ",W0?.version??Jc,W0?.buildDate?` · Built ${W0.buildDate}`:""]}),e.jsx("p",{className:"about-body__tagline",children:"A local-first, scriptable workspace for building typed relational and causal graphs — map how events, concepts, and systems connect."})]})}),U0&&e.jsx(hs,{onConfirm:async(N,Q)=>{F0(!1);try{await f.createTab(N,Q)}catch(u0){$({msg:`Failed to create project: ${u0}`,ok:!1}),setTimeout(()=>$(null),4e3)}},onCancel:()=>F0(!1)}),O&&e.jsx("div",{className:`save-toast${O.ok?"":" save-toast--error"}`,children:O.msg})]})})}function Yc(){const{activeTab:n,tabs:r,loading:t,createTab:s,closeRequestId:a,clearCloseRequest:i,closeTab:l,switchTab:d,setTabSavePath:u,markTabClean:g}=Ar(),[h,c]=o.useState(!1),[b,x]=o.useState(!1),m=r.find(P=>P.id===a)??null,{quitTab:k,quitQueue:w,quitIndex:E,quitBusy:j,handleQuitSave:v,handleQuitDiscard:f,handleQuitCancel:I}=ec({tabs:r,switchTab:d,setTabSavePath:u,markTabClean:g});async function p(){if(!(!m||b)){x(!0);try{let P=m.savePath??null;if(!P){const W=(m.name||"My Graph").replace(/[\\/:*?"<>|]/g,"_").trim()||"My Graph",_=await Yn({title:"Save Graph",defaultPath:`${W}.glograph`,filters:[{name:"GloGraph",extensions:["glograph"]}]});if(!_)return;P=_.endsWith(".glograph")?_:`${_}.glograph`}await r0.saveGraphToPath(P),await r0.recordRecentProject(m.name,P),await u(m.id,P),await g(m.id),i(),await l(m.id,!1)}catch(P){console.error("Save before close failed:",P)}finally{x(!1)}}}async function A(){if(!m||b)return;const P=!m.savePath;i(),await l(m.id,P)}async function F(){const P=await Qn({});if(typeof P=="string")try{await r0.openPathAsTab(P)}catch(W){console.error("Open project failed:",W)}}const{session:Z}=xs(),H=vs(Z),[J,C]=o.useState(null),[z,L]=o.useState(null);return o.useEffect(()=>{if(!H){C(null),L(null);return}let P=!1;return fetch(`${H.base}/api/graph`,{headers:{Authorization:`Bearer ${H.token}`}}).then(W=>{if(!W.ok){const _=W.status===401?"Join token rejected — double-check the code from the host (it’s case-sensitive, and a fresh one is generated if they re-open the Host dialog).":W.status===403?"The host blocked the connection.":`Couldn’t load the session (HTTP ${W.status}).`;throw new Error(_)}return W.json()}).then(W=>{P||(C(W.settings),L(null))}).catch(W=>{P||L(String(W))}),()=>{P=!0}},[H?.base,H?.token]),H?J?e.jsx(Qt,{seed:J,children:e.jsx(Ta,{})},`guest:${H.base}`):e.jsx("div",{className:"app-loading",children:e.jsxs("span",{children:["Connecting to ",Z.address,"…",z?` — ${z}`:""]})}):t?e.jsx("div",{className:"app-loading",children:e.jsx("span",{children:"Loading GloGraph…"})}):n===null?e.jsxs(e.Fragment,{children:[e.jsx(qc,{onNewProject:()=>c(!0),onImport:F}),h&&e.jsx(hs,{onConfirm:async(P,W)=>{c(!1),await s(P,W)},onCancel:()=>c(!1)})]}):e.jsxs(e.Fragment,{children:[e.jsx(Qt,{children:e.jsx(Ta,{})},n.id),m&&!k&&e.jsx(ba,{tab:m,busy:b,onSave:p,onDiscard:A,onCancel:()=>{b||i()}}),k&&w&&e.jsx(ba,{tab:k,quitting:!0,progress:{index:E,total:w.length},busy:j,onSave:v,onDiscard:f,onCancel:I})]})}function Qc(){return e.jsx(kc,{children:e.jsx(Kc,{children:e.jsx(Yc,{})})})}class Xc extends o.Component{state={error:null,componentStack:null};static getDerivedStateFromError(r){return{error:r}}componentDidCatch(r,t){const s=`react-error-boundary: ${r.stack??r.message}
${t.componentStack??""}`;console.error(s),e0("log_frontend_error",{}).catch(()=>{}),this.setState({componentStack:t.componentStack??null})}render(){const{error:r,componentStack:t}=this.state;return r?e.jsx("div",{className:"error-boundary",children:e.jsxs("div",{className:"error-boundary__card",children:[e.jsx("h1",{children:"Something went wrong"}),e.jsx("p",{children:"GloGraph hit an unexpected error and couldn't render. Your saved projects aren't affected — reloading usually clears it."}),e.jsx("pre",{className:"error-boundary__msg",children:r.message||String(r)}),e.jsx("div",{className:"error-boundary__actions",children:e.jsx("button",{className:"btn btn--primary btn--sm",onClick:()=>location.reload(),children:"Reload"})}),e.jsxs("details",{className:"error-boundary__more",children:[e.jsx("summary",{children:"Technical details"}),e.jsx("pre",{children:(r.stack??"")+(t?`
${t}`:"")})]})]})}):this.props.children}}function ys(n){e0("log_frontend_error",{}).catch(()=>{})}window.addEventListener("error",n=>{ys(`error: ${n.message} @ ${n.filename}:${n.lineno}:${n.colno}`)});window.addEventListener("unhandledrejection",n=>{const r=n.reason;ys(`unhandledrejection: ${r instanceof Error?r.stack??r.message:String(r)}`)});Ws.createRoot(document.getElementById("root")).render(e.jsx(Us.StrictMode,{children:e.jsx(Xc,{children:e.jsx(Qc,{})})}));
