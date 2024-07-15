import Fraction from 'fraction.js';
import * as _ from 'underscore';

declare const confetti: any;

export class Helper {
  static ingredientTypes = [
    undefined,
    'protein',
    'fat',
    'carb',
    'carb',
    'carb'
  ];

  static SnackBarDurations = {
    VeryShort: 1000,
    Short: 2000,
    Long: 4000
  };

  static copy(object: any): any {
    // dates
    if(object instanceof Date) {
      return new Date(object.getTime());
      // arrays
    } else if(object instanceof Array) {
      const target = [];

      for(const obj of object) {
        target.push(this.copy(obj));
      }

      return target;
      // objects
    } else if(object instanceof Object) {
      const target: any = {};

      for(const prop in object) {
        if(object.hasOwnProperty(prop)) {
          target[prop] = this.copy(object[prop]);
        }
      }

      return target;
    } else {
      // it's a primitive
      return object;
    }
  }

  static getPageWidth(): number {
    const left = +window.getComputedStyle(document.querySelector('#page-container')!).paddingLeft.replace('px', '');
    const right = +window.getComputedStyle(document.querySelector('#page-container')!).paddingRight.replace('px', '');
    return window.innerWidth - left - right;
  }

  private static fireConfetti(particleRatio: any, opts: any) {
    const count = 200;
    const defaults = {
      disableForReducedMotion: true,
      origin: { y: 1 } // bottom of screen
    };

    confetti(Object.assign({}, defaults, opts, {
      particleCount: Math.floor(count * particleRatio)
    }));
  }

  static celebrate() {
    Helper.fireConfetti(0.25, { spread: 26, startVelocity: 55 });
    Helper.fireConfetti(0.2, { spread: 60 });
    Helper.fireConfetti(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    Helper.fireConfetti(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    Helper.fireConfetti(0.1, { spread: 120, startVelocity: 45 });
  }
}