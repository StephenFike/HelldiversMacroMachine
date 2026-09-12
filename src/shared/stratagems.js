'use strict';

/**
 * Every HELLDIVERS 2 stratagem, with its directional input code.
 *
 * Codes are written from the player's point of view as the raw arrow sequence:
 *   U = Up, D = Down, L = Left, R = Right
 *
 * These are *directions*, not keys. The runner translates each direction into
 * whatever key the player has bound in-game (WASD by default, arrows for some)
 * using settings.directions, so this table never has to change.
 *
 * Source: https://helldivers.wiki.gg/wiki/Stratagems
 */

const STRATAGEMS = [
  // ---------------------------------------------------------------- Orbital
  { id: 'orbital-precision-strike',   name: 'Orbital Precision Strike',      code: 'RRU',       group: 'Orbital', unlock: 'Orbital Cannons' },
  { id: 'orbital-gatling-barrage',    name: 'Orbital Gatling Barrage',       code: 'RDLUU',     group: 'Orbital', unlock: 'Orbital Cannons' },
  { id: 'orbital-airburst-strike',    name: 'Orbital Airburst Strike',       code: 'RRR',       group: 'Orbital', unlock: 'Orbital Cannons' },
  { id: 'orbital-120mm-he-barrage',   name: 'Orbital 120mm HE Barrage',      code: 'RRDLRD',    group: 'Orbital', unlock: 'Orbital Cannons' },
  { id: 'orbital-380mm-he-barrage',   name: 'Orbital 380mm HE Barrage',      code: 'RDUULDD',   group: 'Orbital', unlock: 'Orbital Cannons' },
  { id: 'orbital-walking-barrage',    name: 'Orbital Walking Barrage',       code: 'RDRDRD',    group: 'Orbital', unlock: 'Orbital Cannons' },
  { id: 'orbital-laser',              name: 'Orbital Laser',                 code: 'RDURD',     group: 'Orbital', unlock: 'Orbital Cannons' },
  { id: 'orbital-napalm-barrage',     name: 'Orbital Napalm Barrage',        code: 'RRDLRU',    group: 'Orbital', unlock: 'Orbital Cannons' },
  { id: 'orbital-railcannon-strike',  name: 'Orbital Railcannon Strike',     code: 'RUDDR',     group: 'Orbital', unlock: 'Orbital Cannons' },
  { id: 'orbital-gas-strike',         name: 'Orbital Gas Strike',            code: 'RRDR',      group: 'Orbital', unlock: 'Orbital Cannons' },
  { id: 'orbital-ems-strike',         name: 'Orbital EMS Strike',            code: 'RRLD',      group: 'Orbital', unlock: 'Bridge' },
  { id: 'orbital-smoke-strike',       name: 'Orbital Smoke Strike',          code: 'RRDU',      group: 'Orbital', unlock: 'Orbital Cannons' },

  // ------------------------------------------------------------------ Eagle
  { id: 'eagle-strafing-run',         name: 'Eagle Strafing Run',            code: 'URR',       group: 'Eagle', unlock: 'Hangar' },
  { id: 'eagle-airstrike',            name: 'Eagle Airstrike',               code: 'URDR',      group: 'Eagle', unlock: 'Hangar' },
  { id: 'eagle-cluster-bomb',         name: 'Eagle Cluster Bomb',            code: 'URDDR',     group: 'Eagle', unlock: 'Hangar' },
  { id: 'eagle-napalm-airstrike',     name: 'Eagle Napalm Airstrike',        code: 'URDU',      group: 'Eagle', unlock: 'Hangar' },
  { id: 'eagle-smoke-strike',         name: 'Eagle Smoke Strike',            code: 'URUD',      group: 'Eagle', unlock: 'Hangar' },
  { id: 'eagle-110mm-rocket-pods',    name: 'Eagle 110mm Rocket Pods',       code: 'URUL',      group: 'Eagle', unlock: 'Hangar' },
  { id: 'eagle-500kg-bomb',           name: 'Eagle 500kg Bomb',              code: 'URDDD',     group: 'Eagle', unlock: 'Hangar' },
  { id: 'eagle-gas-airstrike',        name: 'Eagle Gas Airstrike',           code: 'URLR',      group: 'Eagle', unlock: 'Campaigns' },

  // -------------------------------------------------------- Support Weapons
  { id: 'mg-43-machine-gun',          name: 'MG-43 Machine Gun',             code: 'DLDUR',     group: 'Support Weapon', unlock: 'Patriotic Administration Center' },
  { id: 'apw-1-anti-materiel-rifle',  name: 'APW-1 Anti-Materiel Rifle',     code: 'DLRUD',     group: 'Support Weapon', unlock: 'Patriotic Administration Center' },
  { id: 'm-105-stalwart',             name: 'M-105 Stalwart',                code: 'DLDUUL',    group: 'Support Weapon', unlock: 'Patriotic Administration Center' },
  { id: 'eat-17-expendable-at',       name: 'EAT-17 Expendable Anti-Tank',   code: 'DDLUR',     group: 'Support Weapon', unlock: 'Patriotic Administration Center' },
  { id: 'gr-8-recoilless-rifle',      name: 'GR-8 Recoilless Rifle',         code: 'DLRRL',     group: 'Support Weapon', unlock: 'Patriotic Administration Center' },
  { id: 'flam-40-flamethrower',       name: 'FLAM-40 Flamethrower',          code: 'DLUDU',     group: 'Support Weapon', unlock: 'Patriotic Administration Center' },
  { id: 'ac-8-autocannon',            name: 'AC-8 Autocannon',               code: 'DLDUUR',    group: 'Support Weapon', unlock: 'Patriotic Administration Center' },
  { id: 'mg-206-heavy-machine-gun',   name: 'MG-206 Heavy Machine Gun',      code: 'DLUDD',     group: 'Support Weapon', unlock: 'Patriotic Administration Center' },
  { id: 'rl-77-airburst-rocket',      name: 'RL-77 Airburst Rocket Launcher',code: 'DUULR',     group: 'Support Weapon', unlock: 'Patriotic Administration Center' },
  { id: 'mls-4x-commando',            name: 'MLS-4X Commando',               code: 'DLUDR',     group: 'Support Weapon', unlock: 'Patriotic Administration Center' },
  { id: 'faf-14-spear',               name: 'FAF-14 Spear',                  code: 'DDUDD',     group: 'Support Weapon', unlock: 'Patriotic Administration Center' },
  { id: 'rs-422-railgun',             name: 'RS-422 Railgun',                code: 'DRDULR',    group: 'Support Weapon', unlock: 'Patriotic Administration Center' },
  { id: 'sta-x3-wasp-launcher',       name: 'StA-X3 W.A.S.P. Launcher',      code: 'DDUDR',     group: 'Support Weapon', unlock: 'Patriotic Administration Center' },
  { id: 'las-98-laser-cannon',        name: 'LAS-98 Laser Cannon',           code: 'DLDUL',     group: 'Support Weapon', unlock: 'Engineering Bay' },
  { id: 'gl-21-grenade-launcher',     name: 'GL-21 Grenade Launcher',        code: 'DLULD',     group: 'Support Weapon', unlock: 'Engineering Bay' },
  { id: 'arc-3-arc-thrower',          name: 'ARC-3 Arc Thrower',             code: 'DRDULL',    group: 'Support Weapon', unlock: 'Engineering Bay' },
  { id: 'las-99-quasar-cannon',       name: 'LAS-99 Quasar Cannon',          code: 'DDULR',     group: 'Support Weapon', unlock: 'Engineering Bay' },
  { id: 'tx-41-sterilizer',           name: 'TX-41 Sterilizer',              code: 'DLUDL',     group: 'Support Weapon', unlock: 'Chemical Agents' },
  { id: 'cqc-20-breaching-hammer',    name: 'CQC-20 Breaching Hammer',       code: 'DLRLU',     group: 'Support Weapon', unlock: 'Siege Breakers' },
  { id: 'plas-45-epoch',              name: 'PLAS-45 Epoch',                 code: 'DLULR',     group: 'Support Weapon', unlock: 'Control Group' },
  { id: 'mgx-42-bullet-storm',        name: 'MGX-42 Bullet Storm',           code: 'DLDRUL',    group: 'Support Weapon', unlock: 'Exo Experts' },
  { id: 's-11-speargun',              name: 'S-11 Speargun',                 code: 'DRDLUR',    group: 'Support Weapon', unlock: 'Dust Devils' },
  { id: 'cqc-9-defoliation-tool',     name: 'CQC-9 Defoliation Tool',        code: 'DLRRD',     group: 'Support Weapon', unlock: 'Python Commandos' },
  { id: 'gl-52-de-escalator',         name: 'GL-52 De-Escalator',            code: 'DRULR',     group: 'Support Weapon', unlock: 'Force of Law' },
  { id: 'eat-700-expendable-napalm',  name: 'EAT-700 Expendable Napalm',     code: 'DDLUL',     group: 'Support Weapon', unlock: 'Dust Devils' },
  { id: 'eat-411-leveller',           name: 'EAT-411 Leveller',              code: 'DDLUD',     group: 'Support Weapon', unlock: 'Siege Breakers' },
  { id: 'gl-28-belt-fed-gl',          name: 'GL-28 Belt-Fed Grenade Launcher', code: 'DLULUU',  group: 'Support Weapon', unlock: 'Siege Breakers' },
  { id: 'bmd-c4-pack',                name: 'B/MD C4 Pack',                  code: 'DRUURU',    group: 'Support Weapon', unlock: 'Redacted Regiment' },
  { id: 'ms-11-solo-silo',            name: 'MS-11 Solo Silo',               code: 'DURDD',     group: 'Support Weapon', unlock: 'Dust Devils' },
  { id: 'bflam-80-cremator',          name: 'B/FLAM-80 Cremator',            code: 'DDRDUU',    group: 'Support Weapon', unlock: 'Entrenched Division' },
  { id: 'm-1000-maxigun',             name: 'M-1000 Maxigun',                code: 'DLRDUU',    group: 'Support Weapon', unlock: 'Python Commandos' },
  { id: 'cqc-1-one-true-flag',        name: 'CQC-1 One True Flag',           code: 'DLRRU',     group: 'Support Weapon', unlock: 'Masters of Ceremony' },
  { id: '40k-meltagun',               name: '40-K Meltagun',                 code: 'DLULLD',    group: 'Support Weapon', unlock: "Castellan's Creed" },

  // --------------------------------------------------------------- Backpack
  { id: 'b-1-supply-pack',            name: 'B-1 Supply Pack',               code: 'DLDUUD',    group: 'Backpack', unlock: 'Engineering Bay' },
  { id: 'lift-850-jump-pack',         name: 'LIFT-850 Jump Pack',            code: 'DUUDU',     group: 'Backpack', unlock: 'Hangar' },
  { id: 'sh-20-ballistic-shield',     name: 'SH-20 Ballistic Shield Backpack', code: 'DLDDUL',  group: 'Backpack', unlock: 'Engineering Bay' },
  { id: 'ax-ar-23-guard-dog',         name: 'AX/AR-23 Guard Dog',            code: 'DULURD',    group: 'Backpack', unlock: 'Engineering Bay' },
  { id: 'ax-las-5-guard-dog-rover',   name: 'AX/LAS-5 Guard Dog Rover',      code: 'DULURR',    group: 'Backpack', unlock: 'Engineering Bay' },
  { id: 'sh-32-shield-generator',     name: 'SH-32 Shield Generator Pack',   code: 'DULRLR',    group: 'Backpack', unlock: 'Engineering Bay' },
  { id: 'sh-51-directional-shield',   name: 'SH-51 Directional Shield',      code: 'DULRUU',    group: 'Backpack', unlock: 'Urban Legends' },
  { id: 'ax-flam-75-hot-dog',         name: 'AX/FLAM-75 Hot Dog',            code: 'DULULL',    group: 'Backpack', unlock: 'Python Commandos' },
  { id: 'b-100-portable-hellbomb',    name: 'B-100 Portable Hellbomb',       code: 'DRUUU',     group: 'Backpack', unlock: 'Servants of Freedom' },
  { id: 'ax-arc-3-guard-dog-k9',      name: 'AX/ARC-3 Guard Dog K-9',        code: 'DULURL',    group: 'Backpack', unlock: 'Force of Law' },
  { id: 'lift-860-hover-pack',        name: 'LIFT-860 Hover Pack',           code: 'DUUDLR',    group: 'Backpack', unlock: 'Borderline Justice' },
  { id: 'ax-tx-13-dog-breath',        name: 'AX/TX-13 Guard Dog Dog Breath', code: 'DULURU',    group: 'Backpack', unlock: 'Chemical Agents' },
  { id: 'lift-182-warp-pack',         name: 'LIFT-182 Warp Pack',            code: 'DLRDLR',    group: 'Backpack', unlock: 'Control Group' },

  // ---------------------------------------------------------------- Vehicle
  { id: 'm-102-gunner-frv',           name: 'M-102 Gunner FRV',              code: 'LDRDRDU',   group: 'Vehicle', unlock: 'Hangar' },
  { id: 'm-103-supply-frv',           name: 'M-103 Supply FRV',              code: 'LDLLDUR',   group: 'Vehicle', unlock: 'Campaigns' },
  { id: 'm-104-incinerator-frv',      name: 'M-104 Incinerator FRV',         code: 'LDRLDUU',   group: 'Vehicle', unlock: 'Campaigns' },
  { id: 'exo-45-patriot-exosuit',     name: 'EXO-45 Patriot Exosuit',        code: 'LDRULDD',   group: 'Vehicle', unlock: 'Robotics Workshop' },
  { id: 'exo-49-emancipator-exosuit', name: 'EXO-49 Emancipator Exosuit',    code: 'LDRULDU',   group: 'Vehicle', unlock: 'Robotics Workshop' },
  { id: 'exo-51-lumberer-exosuit',    name: 'EXO-51 Lumberer Exosuit',       code: 'LDRURLU',   group: 'Vehicle', unlock: 'Exo Experts' },
  { id: 'exo-55-breakthrough-exosuit',name: 'EXO-55 Breakthrough Exosuit',   code: 'LDRLRDU',   group: 'Vehicle', unlock: 'Exo Experts' },
  { id: 'td-220-bastion',             name: 'TD-220 Bastion MK XVI',         code: 'LDRDLDUDU', group: 'Vehicle', unlock: 'Hangar' },

  // ----------------------------------------------------------------- Sentry
  { id: 'a-mg-43-machine-gun-sentry', name: 'A/MG-43 Machine Gun Sentry',    code: 'DURRU',     group: 'Sentry', unlock: 'Robotics Workshop' },
  { id: 'a-g-16-gatling-sentry',      name: 'A/G-16 Gatling Sentry',         code: 'DURL',      group: 'Sentry', unlock: 'Robotics Workshop' },
  { id: 'a-m-12-mortar-sentry',       name: 'A/M-12 Mortar Sentry',          code: 'DURRD',     group: 'Sentry', unlock: 'Robotics Workshop' },
  { id: 'a-ac-8-autocannon-sentry',   name: 'A/AC-8 Autocannon Sentry',      code: 'DURULU',    group: 'Sentry', unlock: 'Robotics Workshop' },
  { id: 'a-mls-4x-rocket-sentry',     name: 'A/MLS-4X Rocket Sentry',        code: 'DURRL',     group: 'Sentry', unlock: 'Robotics Workshop' },
  { id: 'a-m-23-ems-mortar-sentry',   name: 'A/M-23 EMS Mortar Sentry',      code: 'DURDR',     group: 'Sentry', unlock: 'Robotics Workshop' },
  { id: 'a-arc-3-tesla-tower',        name: 'A/ARC-3 Tesla Tower',           code: 'DURULR',    group: 'Sentry', unlock: 'Bridge' },
  { id: 'a-las-98-laser-sentry',      name: 'A/LAS-98 Laser Sentry',         code: 'DURDUR',    group: 'Sentry', unlock: 'Control Group' },
  { id: 'a-flam-40-flame-sentry',     name: 'A/FLAM-40 Flame Sentry',        code: 'DURDUU',    group: 'Sentry', unlock: 'Urban Legends' },
  { id: 'a-gm-17-gas-mortar-sentry',  name: 'A/GM-17 Gas Mortar Sentry',     code: 'DURDL',     group: 'Sentry', unlock: 'Entrenched Division' },

  // ------------------------------------------------------------ Emplacement
  { id: 'md-6-anti-personnel-mines',  name: 'MD-6 Anti-Personnel Minefield', code: 'DLUR',      group: 'Emplacement', unlock: 'Engineering Bay' },
  { id: 'md-i4-incendiary-mines',     name: 'MD-I4 Incendiary Mines',        code: 'DLLD',      group: 'Emplacement', unlock: 'Engineering Bay' },
  { id: 'md-17-anti-tank-mines',      name: 'MD-17 Anti-Tank Mines',         code: 'DLUU',      group: 'Emplacement', unlock: 'Engineering Bay' },
  { id: 'md-8-gas-mines',             name: 'MD-8 Gas Mines',                code: 'DLLR',      group: 'Emplacement', unlock: 'Engineering Bay' },
  { id: 'fx-12-shield-relay',         name: 'FX-12 Shield Generator Relay',  code: 'DDLRLR',    group: 'Emplacement', unlock: 'Bridge' },
  { id: 'e-mg-101-hmg-emplacement',   name: 'E/MG-101 HMG Emplacement',      code: 'DULRRL',    group: 'Emplacement', unlock: 'Bridge' },
  { id: 'e-gl-21-grenadier-battlement', name: 'E/GL-21 Grenadier Battlement',code: 'DRDLR',     group: 'Emplacement', unlock: 'Bridge' },
  { id: 'e-at-12-at-emplacement',     name: 'E/AT-12 Anti-Tank Emplacement', code: 'DULRRR',    group: 'Emplacement', unlock: 'Urban Legends' },

  // ---------------------------------------------------------------- Mission
  { id: 'reinforce',                  name: 'Reinforce',                     code: 'UDRLU',     group: 'Mission', unlock: 'General' },
  { id: 'resupply',                   name: 'Resupply',                      code: 'DDUR',      group: 'Mission', unlock: 'General' },
  { id: 'sos-beacon',                 name: 'SOS Beacon',                    code: 'UDRU',      group: 'Mission', unlock: 'General' },
  { id: 'eagle-rearm',                name: 'Eagle Rearm',                   code: 'UULUR',     group: 'Mission', unlock: 'General' },
  { id: 'call-in-super-destroyer',    name: 'Call In Super Destroyer',       code: 'UUDDLRLR',  group: 'Mission', unlock: 'General' },
  { id: 'nux-223-hellbomb',           name: 'NUX-223 Hellbomb',              code: 'DULDURDU',  group: 'Mission', unlock: 'General' },
  { id: 'sssd-delivery',              name: 'SSSD Delivery',                 code: 'DDDDDUU',   group: 'Mission', unlock: 'General' },
  { id: 'cargo-container',            name: 'Cargo Container',               code: 'UUDDRD',    group: 'Mission', unlock: 'General' },
  { id: 'seismic-probe',              name: 'Seismic Probe',                 code: 'UULRDD',    group: 'Mission', unlock: 'General' },
  { id: 'tectonic-drill',             name: 'Tectonic Drill',                code: 'UDUDUD',    group: 'Mission', unlock: 'General' },
  { id: 'upload-data',                name: 'Upload Data',                   code: 'LRUUU',     group: 'Mission', unlock: 'General' },
  { id: 'reinforcement-pods',         name: 'Reinforcement Pods (Hellpod)',  code: 'LRUUU',     group: 'Mission', unlock: 'General' },
  { id: 'tactical-video-camera',      name: 'Tactical Video Camera',         code: 'RDDULLU',   group: 'Mission', unlock: 'General' },
  { id: 'aquifer-drill',              name: 'Aquifer Drill',                 code: 'LLLUDRDD',  group: 'Mission', unlock: 'General' },
  { id: 'portable-comms-relay',       name: 'Portable Comms Relay',          code: 'UUDDLLD',   group: 'Mission', unlock: 'General' },
  { id: 'prospecting-drill',          name: 'Prospecting Drill',             code: 'DDLRDD',    group: 'Mission', unlock: 'General' },
  { id: 'hive-breaker-drill',         name: 'Hive Breaker Drill',            code: 'LUDRDD',    group: 'Mission', unlock: 'General' },
  { id: 'e-711-extraction-drill',     name: 'Activate E-711 Extraction Drill', code: 'DDLLDD',  group: 'Mission', unlock: 'General' },
  { id: 'dark-fluid-vessel',          name: 'Dark Fluid Vessel',             code: 'ULRDUU',    group: 'Mission', unlock: 'General' },
  { id: 'super-earth-flag',           name: 'Super Earth Flag',              code: 'DUDU',      group: 'Mission', unlock: 'General' }
];

const GROUP_ORDER = [
  'Orbital',
  'Eagle',
  'Support Weapon',
  'Backpack',
  'Vehicle',
  'Sentry',
  'Emplacement',
  'Mission'
];

module.exports = { STRATAGEMS, GROUP_ORDER };
