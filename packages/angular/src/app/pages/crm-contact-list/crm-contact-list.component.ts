import {
  Component, ViewChild, NgModule,
  OnInit,
} from '@angular/core';
import {
  DxButtonModule,
  DxDataGridModule,
  DxDataGridComponent,
  DxDropDownButtonModule,
  DxSelectBoxModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import { DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { exportDataGrid as exportDataGridToXLSX } from 'devextreme/excel_exporter';
import {
  CardActivitiesModule,
  ContactStatusModule,
} from 'src/app/components';
import { Contact, contactStatusList, ContactStatus, } from 'src/app/types/contact';
import { DxDropDownButtonTypes } from 'devextreme-angular/ui/drop-down-button';
import { CommonModule } from '@angular/common';
import { DataService } from 'src/app/services';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { jsPDF } from 'jspdf';
import notify from "devextreme/ui/notify";
import { formatPhone } from 'src/app/pipes/phone.pipe';
import { FormPopupModule } from 'src/app/components';
import { ContactPanelModule } from 'src/app/components/library/contact-panel/contact-panel.component';
import { ContactNewFormComponent, ContactNewFormModule } from 'src/app/components/library/contact-new-form/contact-new-form.component';

type FilterContactStatus = ContactStatus | 'All';

@Component({
  templateUrl: './crm-contact-list.component.html',
  styleUrls: ['./crm-contact-list.component.scss'],
  providers: [DataService],
})
export class CrmContactListComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;

  @ViewChild(ContactNewFormComponent, { static: false }) contactNewForm: ContactNewFormComponent;

  statusList = contactStatusList;

  filterStatusList = ['All', ...contactStatusList];

  isPanelOpened = false;

  isAddContactPopupOpened = false;

  userId: number;

  dataSource: Contact[];

  constructor(private service: DataService) {}

  ngOnInit(): void {
      this.getAllContacts();
  }

  getAllContacts() {
    this.service.getContacts().subscribe({
      next: (res) => {
        this.dataSource = res;
      }
    })
  }

  addContact() {
    this.isAddContactPopupOpened = true;
  };

  refresh = () => {
    this.dataGrid.instance.refresh();
  };

  rowClick(e: DxDataGridTypes.RowClickEvent) {
    const { data } = e;
    this.userId = data.id;
    this.isPanelOpened = true;
    localStorage.setItem('userid', this.userId.toString());
  }

  onOpenedChange = (value: boolean) => {
    if (!value) {
      this.userId = null;
    }
  };

  onPinnedChange = () => {
    this.dataGrid.instance.updateDimensions();
  };

  filterByStatus = (e: DxDropDownButtonTypes.SelectionChangedEvent) => {
    const { item: status }: { item: FilterContactStatus } = e;

    if (status === 'All') {
      this.dataGrid.instance.clearFilter();
    } else {
      this.dataGrid.instance.filter(['status', '=', status]);
    }
  };

  customizePhoneCell = ({ value }) => value ? formatPhone(value) : undefined;

  onExporting(e) {
    if (e.format === 'pdf') {
      const doc = new jsPDF();
      exportDataGridToPdf({
        jsPDFDocument: doc,
        component: e.component,
      }).then(() => {
        doc.save('Contacts.pdf');
      });
    } else {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Contacts');

      exportDataGridToXLSX({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
      }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Contacts.xlsx');
        });
      });
      e.cancel = true;
    }
  }

  onClickSaveNewContact = () => {
    const { firstName, lastName} = this.contactNewForm.getNewContactData();
    notify({
        message: `New contact "${firstName} ${lastName}" saved`,
        position: { at: 'bottom center', my: 'bottom center' }
      },
      'success');
  };
}

@NgModule({
  imports: [
    DxButtonModule,
    DxDataGridModule,
    DxDropDownButtonModule,
    DxSelectBoxModule,
    DxTextBoxModule,

    ContactPanelModule,
    ContactNewFormModule,
    FormPopupModule,
    CardActivitiesModule,
    ContactStatusModule,

    CommonModule,
  ],
  providers: [],
  exports: [],
  declarations: [CrmContactListComponent],
})
export class CrmContactListModule { }
