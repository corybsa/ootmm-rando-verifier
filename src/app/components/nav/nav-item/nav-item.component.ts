import { AfterViewInit, Component, Input } from '@angular/core';

@Component({
  selector: 'app-nav-item',
  templateUrl: './nav-item.component.html',
  styleUrls: ['./nav-item.component.scss']
})
export class NavItemComponent implements AfterViewInit {
  disableAnimation = true;
  private _folder?: boolean;

  @Input()
  get folder() {
    return this._folder;
  }

  set folder(value: any) {
    this._folder = value !== null && `${value}` !== 'false';
  }

  @Input() link?: string;
  @Input() icon?: string;
  @Input() label?: string;

  ngAfterViewInit(): void {
    // timeout required to avoid the dreaded 'ExpressionChangedAfterItHasBeenCheckedError'
    setTimeout(() => this.disableAnimation = false);
  }
}
