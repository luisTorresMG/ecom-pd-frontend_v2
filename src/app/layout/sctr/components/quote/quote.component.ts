import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Vidaley } from '../../shared/models/vidaley';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import * as moment from 'moment';
import { VidaleyService } from '../../shared/services/vidaley.service';
import { finalize } from 'rxjs/operators';
import { GoogleTagManagerService } from '../../shared/services/google-tag-manager.service';
import { UbigeoService } from '../../../../shared/services/ubigeo/ubigeo.service';
import { Province } from '../../../../shared/models/province/province';
import { District } from '../../../../shared/models/district/district';
import { Municipality } from '../../../../shared/models/municipality/municipality';
import { Subject } from 'rxjs/Subject';
import { SessionService } from '../../../soat/shared/services/session.service';

@Component({
    selector: 'app-quote',
    templateUrl: './quote.component.html',
    styleUrls: ['./quote.component.css'],
})
export class QuoteComponent implements OnInit {
    @Input()
    user: Vidaley;

    @Input()
    loading: boolean;

    @Output()
    formSubmitted = new EventEmitter<Vidaley>();

    quoteForm: FormGroup;

    termTypes = [];
    activities = [];
    subActivities = [];

    datePickerConfig: Partial<BsDatepickerConfig>;

    loaders = {
        term: true,
        activity: true,
        subactivity: false,
    };

    locationLoaders = {
        department: true,
        province: false,
        district: false,
    };

    termDescription: string;
    activityDescription: string;
    subActivityDescription: string;

    departments: Province[] = [];
    provinces: District[];
    districts: Municipality[];

    onDepartmentSuccess: Subject<void> = new Subject<void>();
    onProvinceSuccess: Subject<void> = new Subject<void>();
    onDistrictSuccess: Subject<void> = new Subject<void>();

    selling: any;

    constructor(
        private readonly fb: FormBuilder,
        private readonly vidaleyService: VidaleyService,
        private readonly googleService: GoogleTagManagerService,
        private readonly locationService: UbigeoService,
        private readonly sessionService: SessionService,
    ) { }

    ngOnInit() {

        this.selling = this.sessionService.getSellingPoint();

        const today = this.user.startValidity
            ? moment(this.user.startValidity).toDate()
            : new Date();

        this.quoteForm = this.fb.group({
            term: [this.user.term, [Validators.required]],
            startValidity: [today, [Validators.required]],
            endValidity: [this.user.endValidity, [Validators.required]],
            activity: [this.user.activity, [Validators.required]],
            subactivity: [this.user.subactivity, [Validators.required]],
            riskAddress: [this.user.riskAddress, [Validators.required]],
            riskDepartment: [this.user.riskDepartment, [Validators.required]],
            riskProvince: [this.user.riskProvince, [Validators.required]],
            riskDistrict: [this.user.riskDistrict, [Validators.required]],
            totalWorkers: [
                this.user.totalWorkers,
                [
                    Validators.required,
                    Validators.maxLength(7),
                    Validators.min(1),
                    Validators.max(10000),
                ],
            ],
            totalAmount: [
                this.user.totalAmount,
                [
                    Validators.required,
                    Validators.maxLength(7),
                    Validators.min(930),
                    Validators.max(500000),
                ],
            ],
        });

        this.datePickerConfig = Object.assign(
            {},
            {
                locale: 'es',
                showWeekNumbers: false,
                minDate: today,
                dateInputFormat: 'DD/MM/YYYY',
            }
        );

        this.getFormData();
        this.getDepartments();
        this.setUserLocation(
            this.user.riskDepartment,
            this.user.riskProvince,
            this.user.riskDistrict
        );

        this.qForm['startValidity'].valueChanges.subscribe((r) =>
            this.onTermSelected()
        );
    }

    getFormData() {
        this.vidaleyService
            .payments()
            .pipe(finalize(() => (this.loaders.term = false)))
            .subscribe(
                (response) => {
                    this.termTypes = response;

                    if (Number(this.selling.sellingChannel) === 2020000798 || Number(this.selling.sellingChannel) === 2020000797) {
                        this.termTypes = this.termTypes.filter(x => x.id === 5 || x.id === 4 || x.id === 3);
                    }

                    this.onTermSelected();
                },
                () => {
                    this.googleService.setGenericErrorEvent(
                        'Vida Ley - Paso 3',
                        'Obtener tipo de periodo'
                    );
                }
            );

        this.vidaleyService
            .activities()
            .pipe(finalize(() => (this.loaders.activity = false)))
            .subscribe(
                (response) => {
                    this.activities = response;

                    const activityId = this.qForm['activity'].value;


                    if (Number(this.selling.sellingChannel) === 2020000798 || Number(this.selling.sellingChannel) === 2020000797) {
                        this.activities = this.activities.filter(x => x.id === 15 || x.id === 9);
                    }
                    if (activityId) {
                        this.getSubActivities(activityId);
                    }
                },
                () => {
                    this.googleService.setGenericErrorEvent(
                        'Vida Ley - Paso 3',
                        'Obtener actividades'
                    );
                }
            );
    }

    getDepartments() {
        this.locationService
            .getPostProvince({ nprovince: '0', sdescript: '' })
            .pipe(finalize(() => (this.locationLoaders.department = false)))
            .subscribe((response: Province[]) => {
                this.departments = response;
                this.onDepartmentSuccess.next();
            });
    }

    getProvinces(filter: District) {
        this.locationService
            .getPostDistrict(filter)
            .pipe(finalize(() => (this.locationLoaders.province = false)))
            .subscribe((response: District[]) => {
                this.provinces = response;
                this.onProvinceSuccess.next();
            });
    }

    getDistricts(filter: Municipality) {
        this.locationService
            .getPostMunicipality(filter)
            .pipe(finalize(() => (this.locationLoaders.district = false)))
            .subscribe((response: Municipality[]) => {
                this.districts = response;
                this.onDistrictSuccess.next();
            });
    }

    onDepartmentSelected(nprovince) {
        const filter = <District>{ nprovince, sdescript: '' };
        this.resetForm();

        this.locationLoaders.province = true;
        this.getProvinces(filter);
    }

    onProvinceSelected(nlocal) {
        const filter = <Municipality>{
            nlocal,
            sdescript: '',
        };

        this.locationLoaders.district = true;
        this.qForm['riskDistrict'].setValue(null);
        this.getDistricts(filter);
    }

    setUserLocation(departmentId, provinceId, districtId) {
        this.onDepartmentSuccess.subscribe(() => this.setDepartment(departmentId));

        this.onProvinceSuccess.subscribe(() => {
            const inArray = this.isInArray(provinceId, 'nlocal', this.provinces);

            if (inArray) {
                this.qForm['riskProvince'].setValue(Number(provinceId));
                this.onProvinceSelected(provinceId);
            }
        });

        this.onDistrictSuccess.subscribe(() => {
            const inArray = this.isInArray(
                districtId,
                'nmunicipality',
                this.districts
            );

            if (inArray) {
                this.qForm['riskDistrict'].setValue(Number(districtId));
            }
        });
    }

    setDepartment(departmentId) {
        const inArray = this.isInArray(departmentId, 'nprovince', this.departments);

        if (inArray) {
            this.qForm['riskDepartment'].setValue(Number(departmentId));
            this.onDepartmentSelected(departmentId);
        }
    }

    changeActivity(activity) {
        this.qForm['subactivity'].setValue(null);
        this.activityDescription = activity.description;
        this.getSubActivities(activity.id);
    }

    changeSubActivity(subActivity) {
        this.subActivityDescription = subActivity.description;
    }

    getSubActivities(id: number) {
        this.vidaleyService
            .subActivities(id)
            .pipe(finalize(() => (this.loaders.subactivity = false)))
            .subscribe(
                (response) => (this.subActivities = response),
                () => {
                    //   this.googleService.setGenericErrorEvent(
                    //     'Vida Ley - Paso 3',
                    //     'Obtener sub actividades'
                    //   );
                }
            );
    }

    get qForm() {
        return this.quoteForm.controls;
    }

    showError(controlName: string): boolean {
        return (
            this.qForm[controlName].invalid &&
            (this.qForm[controlName].dirty || this.qForm[controlName].touched)
        );
    }

    onSubmit() {
        this.validate();

        if (this.quoteForm.valid) {
            const formValues = this.quoteForm.value;
            this.formSubmitted.emit({
                ...formValues,
                termDescription: this.termDescription || this.user.termDescription,
                activityDescription:
                    this.activityDescription || this.user.activityDescription,
                subActivityDescription:
                    this.subActivityDescription || this.user.subActivityDescription,
            });
        }
    }

    onTermSelected(e = null) {
        const termId = e ? e.id : this.qForm['term'].value;
        const startValidity = moment(this.qForm['startValidity'].value);

        this.termDescription = (
            this.termTypes.find((t) => t.id === termId) || {}
        ).description;

        switch (termId) {
            case 5:
                this.qForm['endValidity'].setValue(
                    moment(startValidity)
                        .add(1, 'M')
                        .subtract(1, 'd')
                        .format('DD/MM/YYYY')
                );
                break;
            case 4:
                this.qForm['endValidity'].setValue(
                    moment(startValidity)
                        .add(2, 'M')
                        .subtract(1, 'd')
                        .format('DD/MM/YYYY')
                );
                break;
            case 3:
                this.qForm['endValidity'].setValue(
                    moment(startValidity)
                        .add(3, 'M')
                        .subtract(1, 'd')
                        .format('DD/MM/YYYY')
                );
                break;
            case 2:
                this.qForm['endValidity'].setValue(
                    moment(startValidity)
                        .add(6, 'M')
                        .subtract(1, 'd')
                        .format('DD/MM/YYYY')
                );
                break;
            case 1:
                this.qForm['endValidity'].setValue(
                    moment(startValidity)
                        .add(1, 'y')
                        .subtract(1, 'd')
                        .format('DD/MM/YYYY')
                );
                break;
        }
    }

    validate() {
        this.quoteForm.markAllAsTouched();
    }

    validateTotalWorkers() {
        const totalWorkers = this.qForm['totalWorkers'].value;
        const term = this.qForm['term'].value;

        if (!totalWorkers || !term) {
            return;
        }

        // if (totalWorkers < 5 && term !== 1) {
        //   this.qForm['totalWorkers'].setErrors({ totalWorkers: true });
        // } else {
        //   this.qForm['totalWorkers'].setErrors(null);
        // }
    }

    resetForm() {
        this.qForm['riskProvince'].setValue(null);
        this.qForm['riskDistrict'].setValue(null);
    }

    isInArray(id: string, key: string, arr: Array<any>) {
        return arr.findIndex((item) => `${item[key]}` === `${id}`) > -1;
    }
}
