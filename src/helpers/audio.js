// let nextwaveSFX;

// function preload(){
//   nextwaveSFX = loadSound("audio/new_wave_01.ogg");
// }
let nextwaveSFX = new Howl({
  src: ['audio/new_wave_02.ogg'],
  volume: 0.5
});

let next10waveSFX = new Howl({
  src: ['audio/new_wave_01.ogg'],
  volume: 0.5
});

let enemyDeadSFX = new Howl({
  src: ['audio/enemy_ded_01.ogg'],
  volume: 0.5
});

let shootChangeSFX = new Howl({
  src: ['audio/tank_shoot_change.wav'],
  volume: 0.375
});

let enemyHitSFX = new Howl({ src: ['audio/impact/bubble.ogg'], volume: 0.5, stereo: 0 });

let enemyHit5SFXs = [
  new Howl({ src: ['audio/select_005.ogg'], volume: 0.25, stereo: 0 }),
  new Howl({ src: ['audio/select_003.ogg'], volume: 0.25, stereo: 0 }),
  new Howl({ src: ['audio/select_004.ogg'], volume: 0.25, stereo: 0 }),
  new Howl({ src: ['audio/select_005.ogg'], volume: 0.25, stereo: 0 }),
];

let enemyHit4SFXs = [
  new Howl({ src: ['audio/enemy_hit_2_05.ogg'], volume: 0.5, stereo: 0 }),
  new Howl({ src: ['audio/enemy_hit_2_01.ogg'], volume: 0.5, stereo: 0 }),
  new Howl({ src: ['audio/enemy_hit_2_02.ogg'], volume: 0.5, stereo: 0 }),
  new Howl({ src: ['audio/enemy_hit_2_03.ogg'], volume: 0.5, stereo: 0 }),
  new Howl({ src: ['audio/enemy_hit_2_04.ogg'], volume: 0.5, stereo: 0 }),
];
let enemyHit3SFXs = [
  new Howl({ src: ['audio/enemy_hit_01.ogg'], volume: 0.5, stereo: 0 }),
  new Howl({ src: ['audio/enemy_hit_02.ogg'], volume: 0.5, stereo: 0 }),
  new Howl({ src: ['audio/enemy_hit_03.ogg'], volume: 0.5, stereo: 0 }),
  new Howl({ src: ['audio/enemy_hit_04.ogg'], volume: 0.5, stereo: 0 }),
  new Howl({ src: ['audio/enemy_hit_05.ogg'], volume: 0.5, stereo: 0 }),
];
let enemyHit1SFXs = [
  new Howl({ src: ['audio/impact/impactGlass_light_000.ogg'], volume: 0.4, stereo: 0 }),
  new Howl({ src: ['audio/impact/impactGlass_light_001.ogg'], volume: 0.4, stereo: 0 }),
  new Howl({ src: ['audio/impact/impactGlass_light_002.ogg'], volume: 0.4, stereo: 0 }),
  new Howl({ src: ['audio/impact/impactGlass_light_003.ogg'], volume: 0.4, stereo: 0 }),
  new Howl({ src: ['audio/impact/impactGlass_light_004.ogg'], volume: 0.4, stereo: 0 }),
];
let enemyHit2SFXs = [
  new Howl({ src: ['audio/impact/impactGlass_light_000.ogg'], volume: 0.4, stereo: 0 }),
  new Howl({ src: ['audio/impact/impactGlass_light_001.ogg'], volume: 0.4, stereo: 0 }),
  new Howl({ src: ['audio/impact/impactGlass_light_002.ogg'], volume: 0.4, stereo: 0 }),
  new Howl({ src: ['audio/impact/impactGlass_light_003.ogg'], volume: 0.4, stereo: 0 }),
  new Howl({ src: ['audio/impact/impactGlass_light_004.ogg'], volume: 0.4, stereo: 0 }),
];