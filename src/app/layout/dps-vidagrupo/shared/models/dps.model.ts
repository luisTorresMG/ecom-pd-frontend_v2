export class DpsModel {
  answer: IQuestion[];

  constructor(dps) {
    this.answer = [
      {
        question: 1,
        type: 'NUMBER',
        value: dps.q1
      },
      {
        question: 2,
        type: 'NUMBER',
        value: dps.q2
      },
      {
        question: 3,
        type: 'SELECTION',
        value: +dps.q3.answer as any,
        detail: {
          type: 'NUMBER',
          value: +dps.q3.detail as any
        }
      },
      {
        question: 4,
        type: 'SELECTION',
        value: +dps.q4.answer as any,
        detail: {
          type: 'NUMBER',
          value: +dps.q4.detail as any
        }
      },
      {
        question: 5,
        type: 'SELECTION',
        items: [
          {
            question: 1,
            type: 'SELECTION',
            value: +dps.q5.q51.answer as any,
            detail: {
              type: 'TEXT',
              value: dps.q5.q51.detail as any
            }
          },
          {
            question: 2,
            type: 'SELECTION',
            value: +dps.q5.q52.answer as any,
            detail: {
              type: 'TEXT',
              value: dps.q5.q52.detail as any
            }
          },
          {
            question: 3,
            type: 'SELECTION',
            value: +dps.q5.q53.answer as any,
            detail: {
              type: 'TEXT',
              value: dps.q5.q53.detail as any
            }
          },
        ]
      },
      {
        question: 6,
        type: 'SELECTION',
        value: +dps.q6.answer as any,
        detail: {
          type: 'TEXT',
          value: dps.q6.detail as any
        }
      },
      {
        question: 7,
        type: 'SELECTION',
        items: [
          {
            question: 1,
            type: 'SELECTION',
            value: +dps.q7.q71.answer as any,
            detail: {
              type: 'TEXT',
              value: dps.q7.q71.detail as any
            }
          },
          {
            question: 2,
            type: 'SELECTION',
            value: +dps.q7.q72.answer as any,
            detail: {
              type: 'TEXT',
              value: dps.q7.q72.detail as any
            }
          },
        ]
      },
      {
        question: 8,
        type: 'SELECTION',
        value: +dps.q8.answer as any,
        detail: {
          type: 'TEXT',
          value: dps.q8.detail as any
        }
      },
    ];
  }
}

interface IQuestion {
  question: number;
  type: 'NUMBER' | 'SELECTION';
  value?: string;
  detail?: IQuestionDetail;
  items?: {
    question: number;
    type: 'NUMBER' | 'SELECTION';
    value?: string;
    detail?: IQuestionDetail;
  }[];
}

interface IQuestionDetail {
  type: 'NUMBER' | 'TEXT';
  value: 0 | 1 | string;
}
