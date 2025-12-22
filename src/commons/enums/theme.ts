export enum Theme {
  beauty = 'beauty',
  luxury = 'luxury',
  fitness = 'fitness',
  tech = 'tech',
  food = 'food',
  travel = 'travel',
  finance = 'finance',
  fashion = 'fashion',
  parenting = 'parenting',
  personal_dev = 'personal_dev',
  animals = 'animals',
  education = 'education',
}

export namespace Theme {
  export function fromStrings(input: string[]): Theme[] {
    const values = Object.values(Theme);
    return input.filter((item): item is Theme =>
      values.includes(item as Theme),
    );
  }
}
