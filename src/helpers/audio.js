// const nextwaveSFX;

// function preload(){
//   nextwaveSFX = loadSound("audio/new_wave_01.ogg");
// }
const nextwaveSFX = new Howl({
  src: ['audio/new_wave_02.ogg'],
  volume: 0.05
});

const next10waveSFX = new Howl({
  src: ['audio/next_wave.wav'],
  volume: 0.05
});

const enemyDeadSFX = new Howl({
  src: ['audio/enemy_ded_01.ogg'],
  volume: 0.05
});

const critHitSFX = new Howl({
  src: ['audio/crit_hit.wav'],
  volume: 0.05
});

const tankbuddyDropSFX = new Howl({
  src: ['audio/tank_buddy_dropped_02.ogg'],
  volume: 0.4
});

const enemyRBEntSFX = new Howl({
  src: ['audio/enemy_rabbitball_entered.ogg'],
  volume: 0.4
});
const enemyShooterEntSFX = new Howl({
  src: ['audio/enemy_shooter_entered.ogg'],
  volume: 0.4
});
const enemyReflectorEntSFX = new Howl({
  src: ['audio/enemy_reflector_entered.ogg'],
  volume: 0.4
});

const enemyDeadSFXsFirst = [
  new Howl({ src: ['audio/scratch_005.ogg'], volume: 0.0, stereo: 0 }),
  new Howl({ src: ['audio/scratch_004.ogg'], volume: 0.0, stereo: 0 })
]

const itemFinished = [
  new Howl({ src: ['audio/power_finished_01.ogg'], volume: 0.05, stereo: 0 }),
  new Howl({ src: ['audio/power_finished_02.ogg'], volume: 0.05, stereo: 0 })
]

const shootChangeSFX = new Howl({
  src: ['audio/tank_shoot_change.wav'],
  volume: 0.375
});

const itemHitSFX = new Howl({ src: ['audio/impact/impactPlate_light_001.ogg'], volume: 0.1, stereo: 0 });



const enemyHitSFX = new Howl({ src: ['audio/impact/bubble.ogg'], volume: 0.01, stereo: 0 });

const enemyHit2SFX = new Howl({ src: ['audio/impact/tank_buddy_bullet.ogg'], volume: 0.05, stereo: 0 })

const enemyHit5SFXs = [
  new Howl({ src: ['audio/select_005.ogg'], volume: 0.01, stereo: 0 }),
  new Howl({ src: ['audio/select_003.ogg'], volume: 0.01, stereo: 0 }),
  new Howl({ src: ['audio/select_004.ogg'], volume: 0.01, stereo: 0 }),
  new Howl({ src: ['audio/select_005.ogg'], volume: 0.01, stereo: 0 }),
];

const enemyHit4SFXs = [
  new Howl({ src: ['audio/enemy_hit_2_05.ogg'], volume: 0.05, stereo: 0 }),
  new Howl({ src: ['audio/enemy_hit_2_01.ogg'], volume: 0.05, stereo: 0 }),
  new Howl({ src: ['audio/enemy_hit_2_02.ogg'], volume: 0.05, stereo: 0 }),
  new Howl({ src: ['audio/enemy_hit_2_03.ogg'], volume: 0.05, stereo: 0 }),
  new Howl({ src: ['audio/enemy_hit_2_04.ogg'], volume: 0.05, stereo: 0 }),
];
const enemyHit3SFXs = [
  new Howl({ src: ['audio/enemy_hit_01.ogg'], volume: 0.05, stereo: 0 }),
  new Howl({ src: ['audio/enemy_hit_02.ogg'], volume: 0.05, stereo: 0 }),
  new Howl({ src: ['audio/enemy_hit_03.ogg'], volume: 0.05, stereo: 0 }),
  new Howl({ src: ['audio/enemy_hit_04.ogg'], volume: 0.05, stereo: 0 }),
  new Howl({ src: ['audio/enemy_hit_05.ogg'], volume: 0.05, stereo: 0 }),
];
const enemyHit1SFXs = [
  new Howl({ src: ['audio/impact/impactGlass_light_000.ogg'], volume: 0.04, stereo: 0 }),
  new Howl({ src: ['audio/impact/impactGlass_light_001.ogg'], volume: 0.04, stereo: 0 }),
  new Howl({ src: ['audio/impact/impactGlass_light_002.ogg'], volume: 0.04, stereo: 0 }),
  new Howl({ src: ['audio/impact/impactGlass_light_003.ogg'], volume: 0.04, stereo: 0 }),
  new Howl({ src: ['audio/impact/impactGlass_light_004.ogg'], volume: 0.04, stereo: 0 }),
];
const enemyHit2SFXs = [
  new Howl({ src: ['audio/impact/impactGlass_light_000.ogg'], volume: 0.04, stereo: 0 }),
  new Howl({ src: ['audio/impact/impactGlass_light_001.ogg'], volume: 0.04, stereo: 0 }),
  new Howl({ src: ['audio/impact/impactGlass_light_002.ogg'], volume: 0.04, stereo: 0 }),
  new Howl({ src: ['audio/impact/impactGlass_light_003.ogg'], volume: 0.04, stereo: 0 }),
  new Howl({ src: ['audio/impact/impactGlass_light_004.ogg'], volume: 0.04, stereo: 0 }),
];