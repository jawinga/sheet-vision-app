import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  upload(file: File): Observable<any> {
    const isSuccess = Math.random() > 0.2; // 80% success

    if (isSuccess) {
      return of({ message: 'File uploaded successfully' }).pipe(delay(2000));
    } else {
      return throwError(() => new Error('File upload failed')).pipe(delay(2000));
    }
  }
}