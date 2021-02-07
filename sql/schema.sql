CREATE EXTENSION pgcrypto;

\connect awm;
CREATE SCHEMA awm;

CREATE TYPE awm.fbt_style_t AS ENUM ('MS', 'SE');
CREATE TYPE awm.group_style_t AS ENUM (
    'CLUS',     -- Cluster sets
    'EMOM',     -- Every Minute On the Minute
    'SS',       -- Super sets
    'STD',      -- Standard sets
    'WAVE'      -- Contrast Wave
);
CREATE TYPE awm.hic_style_t AS ENUM (
    'AMRAP',    -- As Many Reps (sets) As Possible
    'CIR',      -- Curcuit
    'INT',      -- Intervals
    'TAB'       -- Tabata
);
CREATE TYPE awm.set_type_t AS ENUM ('STD', 'TMD', 'DST');
CREATE TYPE awm.block_type_t AS ENUM ('MS', 'EN', 'SE', 'GC', 'FBT', 'HIC', 'HGC', 'OFF');
CREATE TYPE awm.weight_unit_t AS ENUM ('KG', 'LB', 'BW');

CREATE TABLE awm.user (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(50),
    password VARCHAR(72),
    email TEXT,
    first_name TEXT,
    last_name TEXT
);

CREATE TABLE awm.exercise (
    key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    weight_unit awm.weight_unit_t NOT NULL
);

CREATE TABLE awm.cycle (
    id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id SMALLINT NOT NULL REFERENCES awm.user (id),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

CREATE TABLE awm.workout (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id SMALLINT NOT NULL REFERENCES awm.user (id),
    seqno SMALLINT NOT NULL,
    workout_date DATE CHECK (workout_date > '2015-01-01'),
    created TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'UTC')
);

-- #GC RUN, 2.8mi, 24m56s
-- 1 block (GC), 1 set (RUN), 1 distance_set (2.8mi, 24m56s)
-- #GC BIKE, CX, 70m
-- 1 block (GC), 1 set (BIKE/CX), 1 timed_set (70m)
-- #GC BIKE, TRNR, 70m, Big Ring Ladder x 1
-- 1 block (GC, Big Ring Ladder x 1), 1 set (TRNR), 1 timed_set (70m)
-- #E LSD, Trainer, 60m
-- 1 block (EN), 1 set (TRNR), 1 timed_set (60m)
-- #E RUCK, 30#, 80m, 4.57mi, 17:37, Niwot
-- 1 block (EN, 17:37 Niwot), 1 set (RUCK, 30#), 1 distance_set (4.57mi, 80m)
-- #E HIKE, 115m, 5.2mi Meyers Gulch Trail
-- 1 block (EN, Meyers Gulch Trail), 1 set (HIKE), 1 distance_set (5.2mi, 115m)
-- #HGC ROW, T: 15m, 3374m
-- 1 block (HGC), 1 set (ROW), 1 distance_set (3374m, 15m)
CREATE TABLE awm.block (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id SMALLINT NOT NULL REFERENCES awm.user (id),
    workout_id SMALLINT NOT NULL REFERENCES awm.workout (id),
    block_type awm.block_type_t NOT NULL,
    seqno SMALLINT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    UNIQUE (id, block_type)
);

-- #E FOBBIT (MS)	Trainer	GD: 4x0x10	PD: 4x110x10	65m
-- 1 block (FBT) / 1 fbt_block (MS, TRNR, 60m)
-- 1 set_group / 4 sets (GD, STD)
-- 1 set group / 4 sets (PD, STD)
CREATE TABLE awm.fbt_block (
    id INT NOT NULL PRIMARY KEY REFERENCES awm.block (id),
    user_id SMALLINT NOT NULL REFERENCES awm.user (id),
    exercise TEXT NOT NULL REFERENCES awm.exercise (key),
    style awm.fbt_style_t NOT NULL,
    duration INTERVAL,
    block_type awm.block_type_t DEFAULT 'FBT' CHECK (block_type = 'FBT'),
    FOREIGN KEY (id, block_type) REFERENCES awm.block (id, block_type)
);

-- #HIC	TABATA (4m)	Trainer
-- 1 block (HIC) / 1 hic_block (TAB, 4m)
-- 1 set_group (STD), 1 set (TRNR, TMD, 4m)
--
-- #HIC	ROW, 5x1m, Rest: 1m, 1484m
-- 1 block (HIC) / 1 hic_block (INT, 1m, 1484m)
-- 1 set_group (SS), 5 sets (ROW, TMD, 1m)
-- #HIC	ROW, 5x2m, Rest: 4m
-- #HIC	ROW, 5x2m, Rest: 3-5m
-- #HIC	RUN (HS), 5x40s, REST: 2m
--
-- #HIC	DESC (10@27m2s), IR, BRP, SJ, RPS
-- 1 block (HIC) / 1 hic_block (CIR, 27m2s)
-- 1 set_group (SS) / 4 sets (IR, 10), (BRP, 10) (SJ, 10) (RPS 10)
-- 1 set_group (SS) / 4 sets (IR, 9), (BRP, 9) (SJ, 9) (RPS 9)
-- ...
-- 1 set_group (SS) / 4 sets (IR, 1), (BRP, 1) (SJ, 1) (RPS 1)
-- #HIC	DESC (10@24m20s), BBRx40, BRP, SJ, RPS
CREATE TABLE awm.hic_block (
    id INT NOT NULL PRIMARY KEY REFERENCES awm.block (id),
    user_id SMALLINT NOT NULL REFERENCES awm.user (id),
    style awm.hic_style_t NOT NULL,
    duration INTERVAL,
    distance TEXT,
    block_type awm.block_type_t DEFAULT 'HIC' CHECK (block_type = 'HIC'),
    FOREIGN KEY (id, block_type) REFERENCES awm.block (id, block_type)
);

-- Strength Endurance
CREATE TABLE awm.se_block (
    id INT NOT NULL PRIMARY KEY REFERENCES awm.block (id),
    user_id SMALLINT NOT NULL REFERENCES awm.user (id),
    duration INTERVAL,
    block_type awm.block_type_t DEFAULT 'SE' CHECK (block_type = 'SE'),
    FOREIGN KEY (id, block_type) REFERENCES awm.block (id, block_type)
);

-- Tracks a collection of one or more sets by logical grouping
-- seqno => group number within a block
-- #MS	SDL: 93x5, 109x1, 97x5, 113x1, 101x5, 117x1
-- 1 block (MS)
-- 1 set_group (STD), 6 set/standard_set
-- #HIC	AMRAP (10m), KBS/2: 3x24x10; PS: 10, 10, 10; RR: 3x45x5; STEP: 5, 5, 5
-- 1 block / 1 hic_block (AMRAP, 10m)
-- 1 set_group (SS) / 12 sets in order
-- #HIC	CIRCUIT, KBS/2: 4x20x20s; PS: 20s, 20s, 20s, 20s; BJ: 20s, 20s, 20s, 20s; Rest: 4x1m
-- 1 block / 1 hic_block
-- 4 set_group (CIR) w/KBS/2 set (20s), PS set (20s), BJ set (20s), Rest set (1m)
-- #HIC	CIRCUIT (11m52s); JR: 90s, 90s, 60s, 60s; GD: 10, 10, 8, 8; TRX: 12, 12, 10, 10
-- 4 set_group (CIR) w/JR set, GD set, TRX set
-- RD/IR => 2 awm.standard_set w/group_id to 1 set_group (SUPER)
-- 3 1/6 contrast waves => 2 awm.set w/group_id to 1 set_group (WAVE) per wave
-- 3/3/2 => 3 awm.standard_set w/group_id to 1 set_group (CLUS, 20s)
-- 5 on the minute => 5 awm.standard_set w/group_id to 1 set_group (EMOM, 1m)
-- #HIC	TABATA (4m)	Trainer
-- 1 block (HIC) / 1 hic_block (TAB, 4m)
-- 1 set_group (STD), 1 set (TRNR, 4m)
CREATE TABLE awm.set_group (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id SMALLINT NOT NULL REFERENCES awm.user (id),
    block_id INT NOT NULL REFERENCES awm.block (id),
    style awm.group_style_t NOT NULL,
    seqno SMALLINT NOT NULL
);

-- Basic set values
-- setno => set number within a group
-- set_type: STD (reps), TMD & DST (period or distance or both)
-- reps     => exercise done a number of times
-- period   => exercise time interval
-- distance => exercise distance
CREATE TABLE awm.set (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id SMALLINT NOT NULL REFERENCES awm.user (id),
    block_id INT NOT NULL REFERENCES awm.block (id),
    group_id INT NOT NULL REFERENCES awm.set_group (id),
    exercise TEXT NOT NULL REFERENCES awm.exercise (key),
    unit awm.weight_unit_t NOT NULL,
    set_type awm.set_type_t NOT NULL,
    weight REAL DEFAULT 0.0 NOT NULL,
    setno SMALLINT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    reps SMALLINT,
    duration INTERVAL,
    distance TEXT,
    UNIQUE (id, set_type)
);


