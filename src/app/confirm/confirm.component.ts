import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.css'
})
export class ConfirmComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmComponent>) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}
