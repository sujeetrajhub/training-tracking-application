import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { CourseTableDataService } from 'src/app/components/admin/Services/course-table-data.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import {
  MatDialog,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
  NgForm,
  FormsModule,
} from '@angular/forms';
import { TopicsTableDataService } from 'src/app/components/admin/Services/topics-table-data.service';
import { DeleteDialogueComponent } from '../../courses-table/delete-dialogue/delete-dialogue.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TopicsData } from '../../../models/topics-table.model';
@Component({
  selector: 'app-topics-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
  ],
  templateUrl: './topics-table.component.html',
  styleUrls: ['./topics-table.component.scss'],
})
export class TopicsTableComponent implements OnInit {
  constructor(
    private addTopicsData: TopicsTableDataService,
    private _deleteDialog: MatDialog
  ) {}

  routedTopic!: string;
  displayedColumns: string[] = [
    'actions',
    'order',
    'topicName',
    'theoryTime',
    'practiceTime',
    'summary',
    'content',
  ];

  protected dataSource!: MatTableDataSource<TopicsData>;
  protected editTopicsReactiveForm!: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.getTopicsList();

    this.routedTopic = history.state.code;

    // reactive form init
    this.editTopicsReactiveForm = new FormGroup({
      order: new FormControl(null, Validators.required),
      topicName: new FormControl(null, Validators.required),
      theoryTime: new FormControl(null, Validators.required),
      practiceTime: new FormControl(null, Validators.required),
      summary: new FormControl(null, [
        Validators.required,
        Validators.maxLength(40),
      ]),
      content: new FormControl(null, [Validators.required]),
    });
  }
  // READ DATA
  protected getTopicsList() {
    this.addTopicsData.getTopics().subscribe({
      next: (data: any) => {
        const topicArrays = [];
        for (const obj of data) {
          if (
            obj.topic &&
            Array.isArray(obj.topic) &&
            obj.code == this.routedTopic
          ) {
            topicArrays.push(...obj.topic);
          }
        }
        this.dataSource = new MatTableDataSource(topicArrays);
        // console.log(this.dataSource);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {
        console.log('data has been fetched !');
      },
    });
  }

  // DELETE DATA
  protected deleteTopics(topicName: string) {
    const dialogRef = this._deleteDialog.open(DeleteDialogueComponent, {
      data: { targetTopicName: topicName },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.addTopicsData.deleteTopics(topicName).subscribe({
          next: (data: any) => {
            console.log('emp deleted');
            this.getTopicsList();
          },
          error: (err: any) => {
            console.log(err);
          },
          complete: () => {
            console.log('data has been deleted !');
          },
        });
      }
    });
  }

  // EDIT DATA
  editingRowID: number | null = null;
  protected editTopics(i: number, row: any) {
    // console.log(row);
    this.editingRowID = i;
    this.populateEditFields(row);
  }

  protected populateEditFields(row: any) {
    console.log(row.topic[0].order);
    this.editTopicsReactiveForm.patchValue({
      order: row.order,
      course: row.course,
      theoryTime: row.theoryTime,
      practiceTime: row.practiceTime,
      description: row.description,
      addTopics: row.addTopics,
    });
  }

  protected cancelEditing() {
    this.editingRowID = null;
  }

  protected saveTopics(row: any) {
    // console.log(row.id);
    if (this.editTopicsReactiveForm.valid) {
      this.addTopicsData
        .editTopics(row.id, this.editTopicsReactiveForm.value)
        .subscribe({
          next: (data: any) => {
            console.log(data);
            this.editingRowID = null;
            this.getTopicsList();
          },
        });
    }
  }
}