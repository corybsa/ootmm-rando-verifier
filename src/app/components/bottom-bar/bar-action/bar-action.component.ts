import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-bar-action',
  templateUrl: './bar-action.component.html',
  styleUrls: ['./bar-action.component.scss']
})
export class BarActionComponent implements OnInit {
  @Input() icon: string = '';
  @Input() text: string = '';
  @Input() href: string = '';

  ngOnInit(): void {
  }

}
