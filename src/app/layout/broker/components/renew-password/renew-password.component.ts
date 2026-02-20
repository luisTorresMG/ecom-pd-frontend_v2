import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordService } from '../../services/password/password.service';
import { SessionToken } from '../../../client/shared/models/session-token.model';
import { PasswordStrengthValidator } from '../../../../shared/helpers/password-strength-validator';

@Component({
  standalone: false,
  selector: 'app-renew-password',
  templateUrl: './renew-password.component.html',
  styleUrls: ['./renew-password.component.css'],
})
export class RenewPasswordComponent implements OnInit {
  @ViewChild('modalWindow', { static: true }) modalWindow;

  tokenID = '';

  message = '';
  model: any = {};
  loading = false;
  redirect = false;
  error = '';
  inputForm: FormGroup;
  documents = [];

  visibleInput = false;
  getLimitPasword: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private passwordService: PasswordService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.validateLimitPassword();
  }

  validateLimitPassword() {
    this.loading = true;
    console.log('llama al api')

    this.passwordService.limitPassword().subscribe(
      (result) => {
        if (result[0]?.value) {
            this.getLimitPasword = +result[0]?.value;
            this.initComponent(+result[0]?.value);
        } else {
          this.message = 'Tuvimos un inconveniente realizando tu petición';
          this.modalWindow.show();
        }

        this.closeLoading();
      },
      (error) => {
        this.message = 'Tuvimos un inconveniente realizando tu petición';
        this.modalWindow.show();
        this.closeLoading();
      }
    )
  }

    initComponent(id: number) {
    const reg = new RegExp(/^(?=.*[!@#$%^&*])$/);
    this.inputForm = this.formBuilder.group({
      newpwd: [
        '',
        [
          Validators.required,
          Validators.minLength(id),
          Validators.maxLength(id),
          PasswordStrengthValidator,
        ],
      ],
      checkpwd: [
        '',
        [
          Validators.required,
          Validators.minLength(id),
          Validators.maxLength(id),
          PasswordStrengthValidator,
        ],
      ],
    });

    this.tokenID = this.route.snapshot.queryParams['token'];

    if (this.tokenID) {
      this.visibleInput = true;
    }

  }

  onRenew() {

    if (this.inputForm.invalid) {
      return; 
    }

    this.loading = true;

    const model = {
      idRetrieve: this.tokenID,
      newpwd: this.inputForm.get('newpwd').value,
      checkpwd: this.inputForm.get('checkpwd').value,
    };

    this.passwordService.renewPassword(model).subscribe(
      (result) => {
        this.redirect = result.success;
        this.message = result.success
          ? 'Contraseña actualizada correctamente.'
          : 'No hemos podido validar tus credenciales. Por favor, inténtalo de nuevo.';
        this.modalWindow.show();
        this.closeLoading();
      },
      (error) => {
        this.message = 'Tuvimos un inconveniente realizando tu petición';
        this.modalWindow.show();
        this.closeLoading();
      }
    );
  }

  removeToken() {
    this.passwordService.removeToken().subscribe(
      (result) => {
        if(!result.success) {
          return;
        }

        localStorage.removeItem('currentUser')
      },
      (error) => {
        console.log(error);
      }
    );
  }


  closeLoading() {
    setTimeout(() => {
      this.loading = false;
    }, 101);
  }

  closeMessage() {
    this.modalWindow.hide();

    if (this.redirect === true) {
      this.removeToken();
      setTimeout(() => {
        this.router.navigate(['broker/login']);
      }, 250);
    }
  }
}
