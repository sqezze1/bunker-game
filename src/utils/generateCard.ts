import {
  professions,
  ages,
  health,
  phobias,
  skills,
  hobbies,
  inventory,
  physiques,
  facts,
} from "./cardData";

const random = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export function generateCard() {
  return {
    profession: random(professions),
    age: random(ages),
    health: random(health),
    phobia: random(phobias),
    skill: random(skills),
    hobby: random(hobbies),
    inventory: random(inventory),
    physique: random(physiques),
    fact: random(facts),
  };
}
