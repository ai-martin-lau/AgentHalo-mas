"use strict";

// IDs also used by the one-time store-edition preference migration.
const LEGACY_THEME_IDS = Object.freeze(["ink", "cactus", "turtle", "fox", "acorn", "sunwukong", "crane", "sprout", "owl", "lantern", "halo", "starfish", "nimbus", "crescent", "snow", "bao", "persimmon", "teapot"]);
const BUILTIN_PET_NAMES = Object.freeze({
  "halo": {
    "en": "Halo",
    "zh": "Halo",
    "zh-TW": "Halo",
    "ko": "Halo",
    "ja": "Halo",
    "pt-BR": "Halo",
    "es": "Halo"
  },
  "fox": {
    "en": "Fox",
    "zh": "小狐狸",
    "zh-TW": "小狐狸",
    "ko": "여우",
    "ja": "キツネ",
    "pt-BR": "Raposa",
    "es": "Zorro"
  },
  "panda": {
    "en": "Panda",
    "zh": "熊猫",
    "zh-TW": "熊貓",
    "ko": "판다",
    "ja": "パンダ",
    "pt-BR": "Panda",
    "es": "Panda"
  },
  "octopus": {
    "en": "Octopus",
    "zh": "小章鱼",
    "zh-TW": "小章魚",
    "ko": "문어",
    "ja": "タコ",
    "pt-BR": "Polvo",
    "es": "Pulpo"
  },
  "cat": {
    "en": "Cat",
    "zh": "橘猫",
    "zh-TW": "橘貓",
    "ko": "고양이",
    "ja": "ネコ",
    "pt-BR": "Gato",
    "es": "Gato"
  },
  "bunny": {
    "en": "Bunny",
    "zh": "小兔",
    "zh-TW": "小兔",
    "ko": "토끼",
    "ja": "ウサギ",
    "pt-BR": "Coelho",
    "es": "Conejo"
  },
  "dragon": {
    "en": "Dragon",
    "zh": "小龙",
    "zh-TW": "小龍",
    "ko": "용",
    "ja": "ドラゴン",
    "pt-BR": "Dragão",
    "es": "Dragón"
  },
  "penguin": {
    "en": "Penguin",
    "zh": "企鹅",
    "zh-TW": "企鵝",
    "ko": "펭귄",
    "ja": "ペンギン",
    "pt-BR": "Pinguim",
    "es": "Pingüino"
  },
  "axolotl": {
    "en": "Axolotl",
    "zh": "六角恐龙",
    "zh-TW": "六角恐龍",
    "ko": "우파루파",
    "ja": "ウーパールーパー",
    "pt-BR": "Axolote",
    "es": "Ajolote"
  },
  "wukong": {
    "en": "Monkey King",
    "zh": "孙悟空",
    "zh-TW": "孫悟空",
    "ko": "손오공",
    "ja": "孫悟空",
    "pt-BR": "Rei Macaco",
    "es": "Rey Mono"
  }
});

module.exports = { LEGACY_THEME_IDS, BUILTIN_PET_NAMES };
