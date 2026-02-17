import {
    Component,
    OnInit,
    Input,
    OnChanges,
    SimpleChanges,
    Output,
    ViewChild
} from '@angular/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { EventEmitter } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
    NgbDateStruct,
    NgbDateParserFormatter
} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-input-date',
    host: {
        '(document:click)': 'handleOutsideClick($event)'
    },
    templateUrl: './input-date.component.html',
    styleUrls: ['./input-date.component.css']
})
export class InputDateComponent implements OnInit, OnChanges {
    @Input()
    borderBottom = false;

    @Input()
    returnFormat = 'dd/MM/yyyy';

    @Input()
    returnString = false;

    @Input()
    iconFilter = false;

    @Input()
    inputValue: Date;

    @Output()
    inputValueChange = new EventEmitter<any>();

    @Output()
    outsideClick = new EventEmitter<any>();

    @Input()
    inputHolder = '--/--/----';

    @Input()
    inputStyle: any;

    @Input()
    inputError = false;

    @Input()
    iconStyle: any;

    @Input()
    addOnStyle: any;

    @Input()
    minDate: Date;

    @ViewChild('dp', { static: true }) dp;

    imageClicked = false;

    public bsConfig: Partial<BsDatepickerConfig>;

    constructor() { }

    ngOnInit() {
        const mDate = new Date();

        this.bsConfig = Object.assign(
            {},
            {
                dateInputFormat: 'DD/MM/YYYY',
                locale: 'es',
                showWeekNumbers: false,
                minDate: this.minDate
            }
        );
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('minDate' in changes) {
            if (this.bsConfig) {
              this.bsConfig.minDate = this.minDate || new Date();
            }
          }
     }

    onValueChange(value: Date) {
        // console.log(this.returnString, this.returnFormat, value);
        this.inputValue = value;

        if (this.returnString) {
            try {
                const pipe = new DatePipe('en-US'); // Use your own locale
                const myFormattedDate = pipe.transform(value, this.returnFormat);

                this.inputValueChange.emit(myFormattedDate);
            } catch (error) {
                console.log('error', error);
                this.inputValueChange.emit(value.toDateString());
            }
        } else {
            this.inputValueChange.emit(this.inputValue);
        }
    }

    ventanaCerrada() {
        //console.log('ventanaCerrada', arguments);
    }

    toggleDatepicker() {
        this.imageClicked = true;
        this.dp.toggle();
    }

    handleOutsideClick(e) {
        if (!this.dp.isOpen
            // || e.target.id == this.controlName
            || (e.target.offsetParent && e.target.offsetParent.localName.includes('ngb-datepicker'))
            || !(e.target.parentElement && e.target.parentElement.parentElement && !e.target.parentElement.parentElement.localName.includes('ngb-datepicker'))
        ) {
            if (this.imageClicked) {
                this.outsideClick.emit(this.inputValue);
            }
            this.imageClicked = false;
            return;
        }

        if (this.dp.isOpen && !this.imageClicked) {
            this.outsideClick.emit(this.inputValue);
        }

        this.imageClicked = false;
    }
}
