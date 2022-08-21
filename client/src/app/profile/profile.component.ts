import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { User, UserService, Profile } from '../core';
import { concatMap ,  tap } from 'rxjs/operators';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private cd: ChangeDetectorRef
  ) { }

  profile: Profile;
  currentUser: User;
  isUser: boolean;

  ngOnInit() {
    this.route.data.subscribe(((data: {profile: Profile}) => {
      this.profile = data.profile;
      // Load the current user's data.
      this.cd.markForCheck();
      return this.userService.currentUser.pipe(tap(
        (userData: User) => {
          this.currentUser = userData;
          this.isUser = (this.currentUser.username === this.profile.username);
        }
      ));
    }));
  }

  onToggleFollowing(following: boolean) {
    this.profile.following = following;
  }

}
