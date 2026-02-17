import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class QuestionsService {
  constructor() {}

  getPayload(form: any) {
    return {
      answers: [
        {
          question: 1,
          type: 'NUMBER',
          value: form.group1.talla,
        },
        {
          question: 2,
          type: 'NUMBER',
          value: form.group1.peso,
        },
        {
          question: 3,
          type: 'SELECTION',
          value:
            form.group2.fuma == '1'
              ? '4f813853-d303-430d-892c-fe8d05cb464d'
              : '534a1ae5-0b4f-4195-b3b4-3876aa50e382',
          detail: {
            type: 'NUMBER',
            value: form.group2.fuma_resp || null,
          },
        },
        {
          question: 4,
          type: 'SELECTION',
          value:
            form.group3.presion == '1'
              ? 'ac977ddd-68f8-4194-b56b-fa75131f7717'
              : 'c809920c-783b-4def-b718-04840a671864',
          detail: {
            type: 'NUMBER',
            value:
              form.group3.presion_resp == 1
                ? '15c4df40-2694-405a-913b-201f11a7128c'
                : form.group3.presion_resp == 2
                ? '1570b9e2-666d-45c2-8269-39e33e1308b7'
                : form.group3.presion_resp == 3
                ? 'd958e93b-c6c5-460d-960a-f9392128458b'
                : form.group3.presion_resp == 4
                ? '6f9287be-02b5-4be4-b7b8-f2bab137c198'
                : null,
          },
        },
        {
          question: 5,
          type: 'SELECTION',
          items: [
            {
              question: 5.1,
              type: 'SELECTION',
              value:
                form.group4.cancer == '1'
                  ? 'dc8893aa-7972-4b60-89ff-dd6402552cda'
                  : '6f03c439-0c01-4bc8-ac8f-7c677f1c0e82',
              detail: {
                type: 'TEXT',
                value: form.group4.cancer_rsp || null,
              },
            },
            {
              question: 5.2,
              type: 'SELECTION',
              value:
                form.group4.infarto == '1'
                  ? '766da942-3599-4e5c-9760-f05874692b35'
                  : 'ca411b28-f23b-48f5-bb8b-5afd35f1cfc6',
              detail: {
                type: 'TEXT',
                value: form.group4.infarto_rsp || null,
              },
            },
            {
              question: 5.3,
              type: 'SELECTION',
              value:
                form.group4.gastro == '1'
                  ? '2811afc5-60a8-4d65-866b-5213aaf6a912'
                  : 'd56bd673-c47f-459a-a499-d5f84f3878e2',
              detail: {
                type: 'TEXT',
                value: form.group4.gastro_rsp || null,
              },
            },
          ],
        },
        {
          question: 6,
          type: 'SELECTION',
          value:
            form.group5.hospitalizacion == '1'
              ? '735f9339-bd7d-4b3a-ba44-095e589b0313'
              : '2363c056-77f9-49ff-9e81-9bf4f42a538b',
          detail: {
            type: 'TEXT',
            value: form.group5.hospitalizacion_resp || null,
          },
        },
        {
          question: 7,
          type: 'SELECTION',
          value:
            form.group6.viaja == '1'
              ? 'adca0eb5-a2f2-4faf-9069-ef3b3e084fd8'
              : '600e6240-29c5-47c0-bda2-2263c4dc2263',
          detail: {
            type: 'TEXT',
            value: form.group6.viaja_resp || null,
          },
        },
        {
          question: 8,
          type: 'SELECTION',
          value:
            form.group7.deporte == '1'
              ? 'b3490626-df36-48e3-9fd4-71b9fa810e6e'
              : 'ad1ec3f6-c09b-4b79-955e-6fa08b3e9716',
          detail: {
            type: 'TEXT',
            value: form.group7.deporte_resp || null,
          },
        },
      ],
    };
  }
}
