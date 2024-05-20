import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { DateTime } from 'luxon';
import {
  map,
  groupBy,
  mergeMap,
  toArray,
} from 'rxjs/operators';
import { Task } from 'src/app/types/task';
import { Contact, ContactBase } from 'src/app/types/contact';
import { Sale, SalesOrOpportunitiesByCategory } from '../types/analytics';

const API_URL = 'https://js.devexpress.com/Demos/RwaService/api';

@Injectable()
export class DataService {
  private allContacts = 'contacts';
  private contactById = "idContact"
  constructor(private http: HttpClient) {
  }

  public getContacts(): Observable<Contact[]> {
    const contacts = JSON.parse(localStorage.getItem(this.allContacts));
    return of (contacts);
  }

  public getContact(id: number): Observable<Contact> {
    const contacts = JSON.parse(localStorage.getItem(this.contactById));
    const contact = contacts.find((contact: Contact) => contact.id === id);
    return of(contact);
  }

  public addContact(newContact: ContactBase): Observable<ContactBase[]> {
    let contacts: ContactBase[] = JSON.parse(localStorage.getItem(this.allContacts)) || [];    
    const maxId = contacts.length > 0 ? Math.max(...contacts.map(contact => contact.id)) : 0;
    const id = maxId + 1;  
    const contact: ContactBase = { ...newContact, id };  
    contacts = [...contacts, contact];  
    localStorage.setItem(this.allContacts, JSON.stringify(contacts));
    localStorage.setItem(this.contactById, JSON.stringify(contacts));
    return of(contacts);
  }

  // public getContact = (id: number) =>
  //   this.http.get<Contact>(`${API_URL}/Users/Contacts/${id}`);

  public getTasks = (): Observable<Task[]> =>
    this.http.get<Task[]>(`${API_URL}/Employees/AllTasks`);

  public getFilteredTasks = (): Observable<Task[]> =>
    this.http.get<Task[]>(`${API_URL}/Employees/FilteredTasks`);

  public getTask = (id: number): Observable<Task> =>
    this.http.get<Task>(`${API_URL}/Employees/Tasks/${id}`);

  public getContactNotes = (id: number) =>
    this.http.get(`${API_URL}/Users/Contacts/${id}/Notes`);

  public getContactMessages = (id: number) =>
    this.http.get(`${API_URL}/Users/Contacts/${id}/Messages`);

  public getActiveContactOpportunities = (id: number) =>
    this.getContactOpportunities(id, true);

  public getClosedContactOpportunities = (id: number) =>
    this.getContactOpportunities(id, false);

  public getContactOpportunities = (id: number, isActive: boolean) => this.http
    .get<any>(`${API_URL}/Users/Contacts/${id}/Opportunities`)
    .pipe(
      map((data) => data.filter((_: any, index: number) => {
        const isEven = index % 2 === 0;
        return isActive ? isEven : !isEven;
      })),
    );

  public getSalesByStateAndCity = (startDate: string, endDate: string) => this.http
    .get(`${API_URL}/Analytics/SalesByStateAndCity/${startDate}/${endDate}`);

  public getSalesByState = (data) => {
    let dataByState;
    from(data)
      .pipe(
        groupBy((s: any) => s.stateName),
        mergeMap((group) => group.pipe(toArray())),
        map((val) => {
          let total = 0;
          let percentage = 0;
          val.forEach((v) => {
            total = total + v.total;
            percentage = percentage + v.percentage;
          });

          return {
            stateName: val[0].stateName,
            stateCoords: val[0].stateCoords,
            total,
            percentage,
          };
        }),
        toArray(),
      ).subscribe((data) => {
        dataByState = data;
      });

    return dataByState;
  };

  public getOpportunitiesByCategory = (startDate: string, endDate: string) => this.http
    .get<SalesOrOpportunitiesByCategory>(`${API_URL}/Analytics/OpportunitiesByCategory/${startDate}/${endDate}`);

  public getSalesByCategory = (startDate: string, endDate: string) => this.http
    .get<SalesOrOpportunitiesByCategory>(`${API_URL}/Analytics/SalesByCategory/${startDate}/${endDate}`);

  public getSalesByOrderDate = (groupByPeriod: string) => this.http
    .get<Sale[]>(`${API_URL}/Analytics/SalesByOrderDate/${groupByPeriod}`);

  public getSales = (startDate: string, endDate: string) => this.http
    .get<Sale[]>(`${API_URL}/Analytics/Sales/${startDate}/${endDate}`);

  public getProfile = (id: number) =>
    this.http.get<Record<string, any>>(`${API_URL}/Users/Contacts/${id}`).pipe(
      map((data)=> {
        data.gender = id == 22 ? 'female' : null;
        data.birthDate = new Date('1980/05/03');
        data.hiredDate = new Date('2023/03/03');
        data.department = 'UI/UX';
        data.position = 'Designer';
        data.domainUsername = 'corp\\amelia.harper';
        data.country = 'USA';
        data.city = 'New York';
        data.state = 'New York';
        data.address = '405 E 42nd St';
        data.supervisor = 'Sam Adamson';
        return data;
      })
    );

  public getSupervisors = () => {
    const items = [{
      name: 'Sam Adamson',
      image: ''
    }];

    return from([items])
  };

  public getListDS = () => from([[
    {
      key: 'id',
      items: ['Brett Johnson', 'Tasks', 'Reminder', 'Contacts']
        .map((text) => ({ list: 'My Calendars', text }))
        .concat({ list: 'Other Calendars', text: 'Holidays' }),
    },
  ]]);

  public getDefaultListDS = () => from([[
    {
      key: 'My Calendars',
      items: [
        {
          id: 0,
          text: 'Brett Johnson',
          color: '#B3E5FC',
          checkboxColor: '#29B6F6',
        },
        {
          id: 1,
          text: 'Tasks',
          color: '#C8E6C9',
          checkboxColor: '#66BB6A',
        },
        {
          id: 2,
          text: 'Reminder',
          color: '#FFCDD2',
          checkboxColor: '#EF5350',
        },
        {
          id: 3,
          text: 'Contacts',
          color: '#FFE0B2',
          checkboxColor: '#FFA726',
        }],
    },
    {
      key: 'Other Calendars',
      items: [{
        id: 4,
        text: 'Holidays',
        color: '#F3E5F5',
        checkboxColor: '#AB47BC',
      }],
    },
  ]]);

  public getAppointmentsDefaultTime = (index) => [
    {
      weekDay: 0,
      weekIndex: 0,
      defaultTime: {
        hours: 7,
        minutes: 30,
      },
    },
    {
      weekDay: 1,
      weekIndex: 0,
      defaultTime: {
        hours: 10,
      },
    },
    {
      weekDay: 2,
      weekIndex: 0,
      defaultTime: {
        hours: 8,
        minutes: 30,
      },
    },
    {
      weekDay: 3,
      weekIndex: 0,
      defaultTime: {
        hours: 7,
      },
    },
    {
      weekDay: 0,
      weekIndex: 1,
      defaultTime: {
        hours: 9,
      },
    },
    {
      weekDay: 1,
      weekIndex: 1,
      defaultTime: {
        hours: 7,
      },
    },
    {
      weekDay: 2,
      weekIndex: 1,
      defaultTime: {
        hours: 8,
        minutes: 30,
      },
    },
    {
      weekDay: 3,
      weekIndex: 1,
      defaultTime: {
        hours: 9,
        minutes: 30,
      },
    },
    {
      weekDay: 1,
      weekIndex: 2,
      defaultTime: {
        hours: 8,
        minutes: 20,
      },
    },
    {
      weekDay: 2,
      weekIndex: 2,
      defaultTime: {
        hours: 9,
        minutes: 40,
      },
    },
    {
      weekDay: 3,
      weekIndex: 2,
      defaultTime: {
        hours: 8,
        minutes: 30,
      },
    },
  ][index];

  public getSchedulerTasks = () => {
    const promptDescription = `The HtmlEditor component is a client-side WYSIWYG text editor.
The editor allows users to format text and integrate media elements into documents.
The result can be exported to HTML or Markdown.`;

    return this.getTasks().pipe(
      map((tasks) => {
        const today = DateTime.now();
        const mondayMidnight = today.set({
          weekday: 1, hour: 0, minute: 0, second: 0, millisecond: 0,
        });
        const uniqueTasks = tasks.slice(0, 11);

        return uniqueTasks.map((task, index) => {
          const { weekDay, weekIndex, defaultTime } = this.getAppointmentsDefaultTime(index);
          const taskStart = mondayMidnight.plus({
            weeks: weekIndex,
            days: weekDay,
          }).plus(defaultTime);
          return {
            ...task,
            startDate: taskStart.toJSDate(),
            endDate: taskStart.plus({ hours: 3 }).toJSDate(),
            description: promptDescription,
            calendarId: weekDay,
          };
        });
      }))
  };
}
