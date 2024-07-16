import { Component, EventEmitter, Output } from '@angular/core';
import { IMetadata, TLocationList, TRequirement } from './rando-verifier.interface';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-rando-verifier',
  templateUrl: './rando-verifier.component.html',
  styleUrl: './rando-verifier.component.scss',
  standalone: true,
  imports: [
    MatButtonModule
  ]
})
export class RandoVerifierComponent {
  @Output() fileParsed = new EventEmitter<void>();

  private readonly delimiter = '===========================================================================';
  private metadata?: IMetadata;
  private locationList: TLocationList = {};
  private requirements?: TRequirement;
  private requiredItems?: string[];
  private items?: string[];
  protected file?: File;
  private goldSkulltulaCircularDependency: Array<[string, string]> = [];
  private ootSoulInMm: boolean = false;
  private mmSoulInOot: boolean = false;
  private mmSkullImpossible: boolean = false;
  private ootSkullsImpossible: boolean = false;

  public setRequirements(requirements: TRequirement): void {
    this.requirements = requirements;
  }

  public getRequirements(): TRequirement | undefined {
    return this.requirements;
  }

  public setRequiredItems(requiredItems: string[]): void {
    this.requiredItems = requiredItems;
  }

  public getRequiredItems(): string[] {
    return this.requiredItems || [];
  }

  public getMeta(): IMetadata | undefined {
    return this.metadata;
  }

  public getLocationList(): TLocationList {
    return this.locationList;
  }

  public getItems(): string[] {
    return this.items || [];
  }

  public getLocations(): string[] {
    return Object.keys(this.locationList).sort();
  }

  protected readFile(input: HTMLInputElement): void {
    if(!input.files || input.files.length === 0) {
      return;
    }

    this.file = input.files[0];
    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      this.parseFile(fileReader.result as string);
    }

    fileReader.readAsText(this.file);
  }
  
  public parseFile(file: string): void {
    // split on the line of only equal signs
    const sections = file.split(this.delimiter).map(i => i.trim());

    // save meta info just in case
    this.metadata = this.parseMetadata(sections[0]);

    // find all locations
    const locationListTemp = sections.find(i => i.toLowerCase().startsWith('location list'))?.replace(/location list \(.*\)/i, '');
    
    // to keep track of where we are in the loop
    let currentLocation: string = '';

    for(const region of locationListTemp?.split('\n') || []) {
      // find locations with only 2 spaces in front. these are the overall regions
      if(region.match(/^\s{2}\S.*/)) { // match only 2 spaces at the beginning of the line
        const regionProp = region.replace(/\(.*\):/, '').trim();

        // create a property in the locationList for the region
        this.locationList[regionProp] = {};
        currentLocation = regionProp;
      } else if(region.match(/^\s{4}\S.*/)) { // match only 4 spaces at the beginning of the line
        // create an object of which rewards are found where
        const [area, reward] = region.split(':').map(i => i.trim());
        this.locationList[currentLocation][area] = reward.trim();
      }
    }

    this.items = this.parseItemsFromLocationList();

    this.fileParsed.emit();
  }

  private parseMetadata(rawData: string): IMetadata {
    const obj: IMetadata = {
      settings: {}
    } as IMetadata;

    const rawDataSplit = rawData.split('\n');
    const seedIndex = rawDataSplit.findIndex(i => i.toLowerCase().startsWith('seed'));
    const versionIndex = rawDataSplit.findIndex(i => i.toLowerCase().startsWith('version'));
    const settingsStringIndex = rawDataSplit.findIndex(i => i.toLowerCase().startsWith('settingsstring'));

    if(seedIndex > -1) {
      obj.seed = rawDataSplit[seedIndex].split(':')[1].trim();
    }

    if(versionIndex > -1) {
      obj.version = rawDataSplit[versionIndex].split(':')[1].trim();
    }

    if(settingsStringIndex > -1) {
      obj.settingsString = rawDataSplit[settingsStringIndex].split(':')[1].trim();
    }

    const settingsIndex = rawDataSplit.findIndex(i => i.toLowerCase() === 'settings') + 1;
    const settingsEndIndex = rawDataSplit.slice(settingsIndex).findIndex(i => i.match(/^\s{4}\S.*/));
    const settings = rawDataSplit.slice(settingsIndex, settingsEndIndex).map(i => i.replaceAll(' ', ''));

    for(const setting of settings) {
      const split = setting.split(':');
      obj.settings[split[0]] = ['true', 'false'].includes(split[1]) ? split[1] === 'true' : split[1];
    }

    // TODO: parse extra info here if needed

    return obj;
  }

  private parseItemsFromLocationList(): string[] {
    const items: string[] = [];

    for(const region in this.locationList) {
      for(const location in this.locationList[region]) {
        const item = this.locationList[region][location];
        const isItemJunk = item.match(/(rupee)|((?<!light|fire|ice) arrow)|(bomb)|(nuts)|(seeds)|(heart)|(magic jar)/i) !== null;

        if(!isItemJunk) {
          items.push(item);
        }
      }
    }

    // remove duplicates
    return [...new Set(items)].sort();
  }
  
  private getIndents(indentCount: number): string {
    let indents = '';
    
    for(let i = 0; i < indentCount; i++) {
      indents += '  ';
    }
    
    return indents;
  }
  
  private parseRequirement(item: TRequirement | string[], increaseIndent: boolean = false): string {
    let indentCount = 0;
    
    if(item instanceof Array) {
      return item.join(', ');
    } else {
      let requirement = '';
      const itemKeys = Object.keys(item);
      
      for(let prop of itemKeys) {
        requirement += '\n';
        
        if(increaseIndent) {
          requirement += this.getIndents(++indentCount);
        }
        
        requirement += `- ${prop} requires `;
        
        if(!(item[prop] instanceof Array)) {
          requirement += `${Object.keys(item[prop]).join(', ')}`;
        }
        
        requirement += this.parseRequirement(item[prop], true);
      }
      
      return requirement;
    }
  }
  
  public getRequirementRules(): string {
    let rules = '';
    
    for(const prop in this.requirements) {
      const keys = Object.keys(this.requirements[prop]);
      let requirement = keys.join(', ');
      
      if(this.requirements[prop] instanceof Array) {
        requirement = (this.requirements[prop] as string[]).join('\n  - ');
        rules += `\n${prop} requires \n  - ${requirement}`;
      } else {
        rules += `\n${prop} requires \n  - ${requirement}`;
        rules += `${this.parseRequirement(this.requirements[prop])}\n`;
      }
    }
    
    return rules.trim();
  }

  private checkSkulltulaSoul(): string {
    let reason = '';

    if(this.metadata?.settings.soulsMiscOot || this.metadata?.settings.soulsMiscMm) {
      for(const region in this.locationList) {
        const values = Object.values(this.locationList[region]);

        // check if the soul is in the region
        const regionContainsGoldSkulltulaSoul = values.find(i => i.toLowerCase().startsWith('soul of gold skulltula'));

        if(regionContainsGoldSkulltulaSoul) {
          // get key value pair 
          const soul = Object.entries(this.locationList[region]).find(i => i[1].toLowerCase().startsWith('soul of gold skulltula'));
          
          if(!soul) {
            continue;
          }

          const location = soul[0];
          const reward = soul[1];

          // check if the MM soul is found in an MM spider house
          const localMmSkullImpossible = location.match(/mm.*skulltula/i) !== null && reward.match(/\(mm\)/i) !== null;
          this.mmSkullImpossible = this.mmSkullImpossible || localMmSkullImpossible;

          if(localMmSkullImpossible) {
            reason += `\n${soul[1]} is found in ${soul[0]}`;
          }

          // check if the OoT soul is found in an OoT gold skulltula
          const localOotSkullsImpossible = location.match(/oot.*gs/i) !== null && reward.match(/\(oot\)/i) !== null;
          this.ootSkullsImpossible = this.ootSkullsImpossible || localOotSkullsImpossible;

          if(localOotSkullsImpossible) {
            reason += `\n${soul[1]} is found in ${soul[0]}`;
          }

          // check if the MM soul is found in an OoT gold skulltula
          // and the OoT soul is found in an MM skulltula
          this.ootSoulInMm = location.match(/^mm/i) !== null && reward.match(/\(oot\)/i) !== null;
          this.mmSoulInOot = location.match(/^oot/i) !== null && reward.match(/\(mm\)/i) !== null;

          if(this.ootSoulInMm) {
            this.goldSkulltulaCircularDependency.push(soul);
          }

          if(this.mmSoulInOot) {
            this.goldSkulltulaCircularDependency.push(soul);
          }
        }
      }
    }

    return reason;
  }

  private checkRequiredItemsInSkulltulas(): string {
    let reason = '';

    // check if there are any required items in oot skulltulas
    if(this.ootSkullsImpossible) {
      for(const region in this.locationList) {
        for(const location in this.locationList[region]) {
          const reward = this.locationList[region][location];

          if(location.match(/oot.*gs/i) && this.requiredItems?.includes(reward)) {
            reason += `\n${reward} is found in ${location}, and OoT Gold Skulltulas are impossible`;
          }
        }
      }
    }

    // check if there are any required items in mm skulltulas
    if(this.mmSkullImpossible) {
      for(const region in this.locationList) {
        for(const location in this.locationList[region]) {
          const reward = this.locationList[region][location];

          if(location.match(/mm.*skulltula/i) && this.requiredItems?.includes(reward)) {
            reason += `\n${reward} is found in ${location}, and MM Skulltulas are impossible`;
          }
        }
      }
    }

    // the soul in mm is unlocked by killing a spider in oot,
    // but the soul in oot is unlocked by killing a spider in mm.
    // this creates a circular dependency and is therefore impossible
    if(this.goldSkulltulaCircularDependency?.length > 1) {
      reason += '\n\nCircular dependency found:';
      reason += `\n${this.goldSkulltulaCircularDependency[0][1]} is found in ${this.goldSkulltulaCircularDependency[0][0]}`;
      reason += `\n${this.goldSkulltulaCircularDependency[1][1]} is found in ${this.goldSkulltulaCircularDependency[1][0]}`;
    }

    return reason;
  }
  
  /**
   * returns null if seed is possible, string if seed is impossible.
   * The returned string will contain the reason why the seed is impossible.
   */
  public verifySeed(): string | null {
    if(!this.requirements) {
      return null;
    }

    let reason = '';

    // check requirements list
    for(const region in this.locationList) {
      if(this.requirements[region]) {
        const values = Object.values(this.locationList[region]);

        for(const check of values) {
          if(this.requirements[region].includes(check)) {
            reason += `\n${check} is found in ${region}`;
          }
        }
      }
    }

    reason += this.checkSkulltulaSoul();
    reason += this.checkRequiredItemsInSkulltulas();

    return reason;
  }
}
