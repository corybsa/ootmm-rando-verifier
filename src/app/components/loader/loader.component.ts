import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { loaderSelectors } from 'src/app/state/loader/loader.selectors';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  store = inject(Store);
  
  fullRequests$ = this.store.select(loaderSelectors.fullRequests);
  smallRequests$ = this.store.select(loaderSelectors.smallRequests);
}
