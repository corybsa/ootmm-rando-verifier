import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { RandoVerifierComponent } from '../rando-verifier/rando-verifier.component';
import { TRequirement } from '../rando-verifier/rando-verifier.interface';
import { MatAutocomplete, MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatListModule } from '@angular/material/list';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { map, Observable, startWith } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RandoVerifierComponent,
    MatAutocompleteModule,
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatExpansionModule,
    MatTooltipModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  @ViewChild(RandoVerifierComponent) randoVerifier!: RandoVerifierComponent;

  protected isFileUploaded = false;
  protected impossibleReason: string | null = null;
  protected itemsControl = new FormControl();
  protected locationsControl = new FormControl();
  protected requirementsControl = new FormControl();
  protected filteredItems!: Observable<string[]>;
  protected filteredLocations!: Observable<string[]>;
  protected filteredRequirements!: Observable<string[]>;
  protected panelOpenState = signal<boolean>(false);

  private requirements: TRequirement = {
    'The Moon': [
      'Oath to Order',
      'Ocarina (MM)',
      'A Button',
      'C-Down Button',
      'C-Right Button',
      'C-Up Button',
    ],
    'Woodfall Temple': [
      'Sonata of Awakening',
    ]
  };

  private requiredItems: string[] = [
    'Light Arrows (OoT)',
    'Oath to Order',
    'Master Sword'
  ];

  ngOnInit(): void {
    this.filteredItems = this.itemsControl.valueChanges.pipe(
      startWith(''),
      map(value => this.itemFilter(value || '')),
    );

    this.filteredLocations = this.locationsControl.valueChanges.pipe(
      startWith(''),
      map(value => this.locationFilter(value || '')),
    );

    this.filteredRequirements = this.requirementsControl.valueChanges.pipe(
      startWith(''),
      map(value => this.itemFilter(value || '')),
    );
  }

  public runChecks(): void {
    this.isFileUploaded = true;
    this.randoVerifier.setRequirements(this.requirements);
    this.randoVerifier.setRequiredItems(this.requiredItems);
    this.impossibleReason = this.randoVerifier.verifySeed();
  }

  protected addRequiredItem(e: MatAutocompleteSelectedEvent): void {
    this.requiredItems.push(e.option.value);
    this.requiredItems = [...new Set(this.requiredItems)];
    this.itemsControl.setValue('');
    this.runChecks();
  }

  protected removeRequiredItem(item: string): void {
    this.requiredItems = this.requiredItems.filter(i => i !== item);
    this.runChecks();
  }

  protected getRequirements(): any {
    return Object.entries(this.randoVerifier.getRequirements() || {});
  }

  private itemFilter(value: string): string[] {
    return this.randoVerifier.getItems().filter(i => i.toLowerCase().includes(value.toLowerCase()));
  }

  private locationFilter(value: string): string[] {
    return this.randoVerifier.getLocations().filter(l => l.toLowerCase().includes(value.toLowerCase()));
  }

  protected removeLocationRequirement(location: string, item: string): void {
    this.requirements[location] = this.requirements[location].filter(i => i !== item);

    if(this.requirements[location].length === 0) {
      delete this.requirements[location];
    }

    this.runChecks();
  }

  protected addRequirement(): void {
    if(!this.locationsControl.value || !this.requirementsControl.value) {
      return;
    }

    this.requirements[this.locationsControl.value] = [
      ...this.requirements[this.locationsControl.value] || [],
      this.requirementsControl.value
    ];

    this.requirementsControl.setValue('');

    this.runChecks();
  }
}
