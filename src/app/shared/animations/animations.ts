import {
  trigger,
  animate,
  style,
  AnimationTriggerMetadata,
  transition,
} from '@angular/animations';

export const fadeAnimation: AnimationTriggerMetadata = trigger('fade', [
  transition(':enter', [
    style({
      opacity: 0,
    }),
    animate(
      250,
      style({
        opacity: 1,
      })
    ),
  ]),
  transition(':leave', [
    animate(
      0,
      style({
        opacity: 0,
      })
    ),
  ]),
]);

export const enterAnimation: AnimationTriggerMetadata = trigger('entrada', [
  transition(':enter', [
    style({
      opacity: 0.5,
      transform: 'translateY(-15px)',
    }),
    animate(
      150,
      style({
        opacity: 1,
        transform: 'translateY(0)',
      })
    ),
  ]),
  transition(':leave', [
    animate(
      50,
      style({
        opacity: 0.5,
        transform: 'translateY(-15px)',
      })
    ),
  ]),
]);
