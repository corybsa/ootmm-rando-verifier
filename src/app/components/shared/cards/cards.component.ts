import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICardButton } from 'src/app/models/card/card-button';
import { CardTypes } from 'src/app/models/card/card-types';
import { Helper } from 'src/app/models/helper';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent {
  @Input() data!: CardTypes[];
  @Input() reorderable: boolean = false;
  @Input() enableSlide: boolean = false;
  @Input() buttons?: [ICardButton, ICardButton?];
  @Input() isRecipe = false;
  @Input() isSharedRecipe = false;
  @Input() isIngredient = false;
  @Input() isCart = false;

  @Output() onDrop = new EventEmitter();
  @Output() onClick = new EventEmitter();
  @Output() onTitleClick = new EventEmitter();
  @Output() onAddToCart = new EventEmitter();
  @Output() onDelete = new EventEmitter();
  @Output() onDone = new EventEmitter();
  @Output() onUndone = new EventEmitter();

  revealingCard: any = null;
  isRevealing = false;
  dontReveal = false;
  isMouseDown = false;
  startX = 0;
  startY = 0;
  offsetX = 0;

  drop(event: CdkDragDrop<CardTypes[]>) {
    const list = Helper.copy(this.data);
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    
    for(let i = 0; i < list.length; i++) {
      list[i].sortOrder = i + 1;
    }

    this.onDrop.emit(list);
  }

  click(item: CardTypes, e: any) {
    if(this.isRevealing) {
      return;
    }

    if(e.target.nodeName === 'MAT-ICON') {
      return;
    }

    if(e.target.nodeName === 'SPAN' && e.target.parentElement.nodeName === 'MAT-CARD-TITLE') {
      this.onTitleClick.emit(item);
    }

    this.onClick.emit(item);
  }

  addToCart(item: CardTypes) {
    this.onAddToCart.emit(item);
  }

  deleteItem(item: CardTypes) {
    this.onDelete.emit(item);
  }

  markDone(item: CardTypes) {
    this.onDone.emit(item);
  }

  undoDone(item: CardTypes) {
    this.onUndone.emit(item);
  }

  startDrag($event: MouseEvent | TouchEvent) {
    if($event instanceof TouchEvent) {
      this.startX = $event.touches[0].clientX;
      this.startY = $event.touches[0].clientY;
    } else {
      this.isMouseDown = true;
      this.startX = $event.clientX;
      this.startY = $event.clientY;
    }
  }

  drag($event: MouseEvent | TouchEvent) {
		if(this.dontReveal || !this.enableSlide) {
			return;
		}

    if($event instanceof MouseEvent && !this.isMouseDown) {
      return;
    }

    this.revealingCard = $event.target as any;

    while(this.revealingCard!.nodeName !== 'MAT-CARD') {
      this.revealingCard = this.revealingCard!.parentElement;
    }

    let deltaX = 0;
    let deltaY = 0;

    if($event instanceof TouchEvent) {
      deltaX = this.startX - $event.touches[0].clientX;
      deltaY = Math.abs(this.startY - $event.touches[0].clientY);
    } else {
      deltaX = this.startX - $event.clientX;
      deltaY = Math.abs(this.startY - $event.clientY);
    }

    // if the user swipes more than 10 px up or down then
    // they probably aren't trying to reveal the actions
    // so we can stop checking
    if(deltaY > 10 && !this.isRevealing) {
      this.isMouseDown = false;
      this.dontReveal = true;
      this.endDrag();
      return;
    }

    // if the user has swiped more than 10 px to the left
    // and they haven't already swiped more than 10 px up or down
    let pos = +(this.revealingCard.dataset.offset ?? 0) + deltaX;

    if(deltaX > 10 && !this.dontReveal) {
      // if the user has scrolled the card 32px or more
      if(deltaX >= 32) {
        this.isRevealing = true;
      }
    } else {
      if(!this.isRevealing) {
        this.isRevealing = false;
      }
      
      pos = Math.max(pos, 0);
    }
    
    this.revealingCard.classList.add('revealing');
    this.revealingCard.style.transform = `translate(${-pos}px, 0)`;
	}

  endDrag() {
    this.isMouseDown = false;
    this.revealingCard?.classList.remove('revealing');

    window.setTimeout(() => {
      if(this.isRevealing) {
        if(this.buttons) {
          this.offsetX = (64 * this.buttons.length) + (5 * (this.buttons.length - 1)) + 5;
        } else {
          this.offsetX = 0;
        }
      } else {
        this.offsetX = 0;
      }

      if(this.revealingCard) {
        this.revealingCard.setAttribute('data-offset', this.offsetX);
        this.revealingCard.style.transform = `translate(${-this.offsetX}px, 0)`;
      }

      this.isRevealing = false;
      this.dontReveal = false;
      this.offsetX = 0;
    }, 50);
  }

  getButtonIcon(button: ICardButton, item: any) {
    if(button.altIcon) {
      if(item[button.iconLogic!]) {
        return button.altIcon;
      }
    }
    
    return button.icon;
  }

  buttonClick(button: ICardButton, item: any) {
    this.endDrag();
    button.action(item);
  }
}
