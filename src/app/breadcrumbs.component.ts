import { Component, OnInit, OnDestroy } from '@angular/core';
import { UIRouter, PathNode, Transition } from '@uirouter/core';

// Add `breadcrumb` to typescript definitions for StateObject and StateDeclaration
declare module "@uirouter/core/lib/state/stateObject" {
  interface StateObject {
    breadcrumb?: (trans: Transition) => string;
  }
}

declare module "@uirouter/core/lib/state/interface" {
  interface StateDeclaration {
    breadcrumb?: (trans: Transition) => string;
  }
}

interface Crumb {
  state: string;
  text: string;
}

// This is a home component for authenticated users.
// It shows giant buttons which activate their respective submodules: Messages, Contacts, Preferences
@Component({
  selector: 'app-breadcrumbs',
  template: `
    <ul class="breadcrumbs">
      <li *ngFor="let crumb of crumbs">
        <a [uiSref]="crumb.state">{{crumb.text}}</a>
      </li>
    </ul>
  `,
  styles: [`
    .breadcrumbs { list-style: none; }
    ul li { display: inline; }
    li + li:before { content: '/'; padding: 1em; }
  `]
})
export class BreadcrumbsComponent implements OnDestroy {
  private unsub: any;
  private crumbs: Crumb[] = [];

  constructor(public router: UIRouter) {
    this.updateCrumbs(router.globals.successfulTransitions.peekTail())
    this.unsub = router.transitionService.onSuccess({}, trans => this.updateCrumbs(trans));
  }

  private updateCrumbs(trans: Transition) {
    this.crumbs = trans.treeChanges('to')
      .filter(node => node.state.breadcrumb)
      .map(node => {
        return { 
          state: node.state.name, 
          text: node.state.breadcrumb(trans)
        }
      });
  }

  ngOnDestroy() {
    this.unsub();
  }
}
