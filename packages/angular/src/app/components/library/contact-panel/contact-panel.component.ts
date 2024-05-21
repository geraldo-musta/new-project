import {
  Component,
  OnInit,
  OnChanges,
  OnDestroy,
  NgModule,
  Output,
  Input,
  SimpleChanges,
  EventEmitter,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  DxAccordionModule,
  DxButtonModule,
  DxDropDownButtonModule,
  DxToolbarModule,
  DxLoadPanelModule,
  DxScrollViewModule,
  DxFormModule,
  DxValidatorModule,
  DxValidationGroupModule,
} from 'devextreme-angular';
import { DxButtonTypes } from 'devextreme-angular/ui/button';
import {
  FormTextboxModule,
  FormPhotoModule,
  CardActivitiesModule,
  ContactStatusModule,
} from 'src/app/components';
import { ScreenService, DataService } from 'src/app/services';
import { distinctUntilChanged, Subject, Subscription} from 'rxjs';
import { Contact } from 'src/app/types/contact';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'contact-panel',
  templateUrl: './contact-panel.component.html',
  styleUrls: ['./contact-panel.component.scss'],
  providers: [DataService],
})
export class ContactPanelComponent implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
  @Input() isOpened = false;
  @Input() userId: number;
  @Input() userName: string;
  @Output() isOpenedChange = new EventEmitter<boolean>();
  @Output() pinnedChange = new EventEmitter<boolean>();

  private pinEventSubject = new Subject<boolean>();
  user: Contact;
  pinned = false;
  isLoading = true;;
  isEditing = false;
  isPinEnabled = false;
  userPanelSubscriptions: Subscription[] = [];

  constructor(private screen: ScreenService, private service: DataService, private router: Router) {
    this.userPanelSubscriptions.push(
      this.screen.changed.subscribe(this.calculatePin),
      this
        .pinEventSubject
        .pipe(distinctUntilChanged())
        .subscribe(this.pinnedChange)
    );
  }

  ngOnInit(): void {
    this.calculatePin();
  }

  ngAfterViewChecked(): void {
    this.pinEventSubject.next(this.pinned);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { userId } = changes;
    if (userId?.currentValue) {
      this.loadUserById(userId.currentValue);
    }
  }

  ngOnDestroy(): void {
    this.userPanelSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadUserById(id: number) {
    this.isLoading = true;
      this.service.getContact(id).subscribe({
      next: (data) => {
        this.user = data;
        this.isEditing = false;
        setTimeout(() => {
          this.isLoading = false;
        }, 350);
      },
      error:() => {
        notify({
          
        })
      }
    })
  };

  onClosePanel = () => {
    this.isOpened = false;
    this.pinned = false;
    this.isOpenedChange.emit(this.isOpened);
  };

  onPinClick = () => {
    this.pinned = !this.pinned;
  };

  onSaveClick = ({ validationGroup } : DxButtonTypes.ClickEvent) => {
    if (!validationGroup.validate().isValid) return;
    this.isEditing = !this.isEditing;
  }

  calculatePin = () => {
    this.isPinEnabled = this.screen.sizes['screen-large'] || this.screen.sizes['screen-medium'];
    if (this.pinned && !this.isPinEnabled) {
      this.pinned = false;
    }
  };

  toggleEdit = () => {
    this.isEditing = !this.isEditing;
  };

  navigateToDetails() {
    localStorage.setItem('userid', this.userId.toString());
    localStorage.setItem('userName', this.userName.toString());
    this.router.navigate(['/crm-contact-details']);
  };
}

@NgModule({
  imports: [
    DxAccordionModule,
    DxButtonModule,
    DxDropDownButtonModule,
    DxToolbarModule,
    DxLoadPanelModule,
    DxScrollViewModule,
    DxFormModule,
    DxValidatorModule,
    DxValidationGroupModule,

    FormTextboxModule,
    FormPhotoModule,
    CardActivitiesModule,
    ContactStatusModule,
    CommonModule,
  ],
  declarations: [ContactPanelComponent],
  exports: [ContactPanelComponent],
})
export class ContactPanelModule { }
