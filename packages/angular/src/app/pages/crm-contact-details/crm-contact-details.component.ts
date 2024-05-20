import {
  Component, OnInit, NgModule,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxButtonModule,
  DxDropDownButtonModule,
  DxScrollViewModule,
} from 'devextreme-angular';
import {
  CardActivitiesModule,
  CardNotesModule,
  CardMessagesModule,
} from 'src/app/components';
import { DataService } from 'src/app/services';
import { forkJoin, map } from 'rxjs';
import { Contact } from 'src/app/types/contact';
import { Messages } from 'src/app/types/messages';
import { Notes } from 'src/app/types/notes';
import { Opportunities } from 'src/app/types/opportunities';
import { ContactFormModule } from 'src/app/components/library/contact-form/contact-form.component';
import { ContactCardsModule } from 'src/app/components/utils/contact-cards/contact-cards.component';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  templateUrl: './crm-contact-details.component.html',
  styleUrls: ['./crm-contact-details.component.scss'],
  providers: [DataService],
})
export class CrmContactDetailsComponent implements OnInit {
  userId: number;

  contactData: Contact;

  contactNotes: Notes;

  contactMessages: Messages;

  activeOpportunities: Opportunities;

  closedOpportunities: Opportunities;

  contactName: string;

  isLoading = false;

  constructor(private service: DataService, private router: Router ) {
    const storedId = localStorage.getItem('userid');
    this.userId = +storedId
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData = () => {
    this.isLoading = true;
    forkJoin([
      this.service.getContactNotes(this.userId),
      this.service.getContactMessages(this.userId),
      this.service.getActiveContactOpportunities(this.userId),
      this.service.getClosedContactOpportunities(this.userId),
    ]).pipe(
      map(
        ([
          contactNotes,
          contactMessages,
          activeOpportunities,
          closedOpportunities
        ]) => ({
          contactNotes,
          contactMessages,
          activeOpportunities,
          closedOpportunities
        }))
      ).subscribe({
        next: (data) => {
          Object.keys(data).forEach((key) => this[key] = data[key])
        },
        error: () => {
          this.isLoading = false;
        }
      }
    );
    this.service.getContact(this.userId).subscribe( {
      next:(data) => {
      this.contactName = data?.name;
      this.contactData = data;
      setTimeout(() => {
        this.isLoading = false;
      }, 350)
      },
      error: () => {
        this.isLoading = false;
      }
    })
  };

  refresh = () => {
    this.isLoading = true;
    this.loadData();
  };

  goBack() {
    this.router.navigate(['/crm-contact-list'])
  }
}

@NgModule({
  imports: [
    DxButtonModule,
    DxDropDownButtonModule,
    DxScrollViewModule,
    DxToolbarModule,

    ContactFormModule,
    ContactCardsModule,

    CardActivitiesModule,
    CardNotesModule,
    CardMessagesModule,

    CommonModule,
  ],
  providers: [],
  exports: [],
  declarations: [CrmContactDetailsComponent],
})
export class CrmContactDetailsModule { }
