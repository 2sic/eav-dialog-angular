import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { App } from '../models/app.model';

@Component({
  selector: 'app-apps-management',
  templateUrl: './apps-management.component.html',
  styleUrls: ['./apps-management.component.scss']
})
export class AppsManagementComponent implements OnInit {
  apps: App[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
  ) {
    // const queryParameters = new QueryParameters();
    // Object.keys(queryParameters).forEach(key => {
    //   if (queryParameters.hasOwnProperty(key)) {
    //     queryParameters[key] = sessionStorage.getItem(key);
    //   }
    // });
    // queryParameters['AAA_RANDOM'] = randomIntFromInterval(10000, 99999);
    // this.router.navigate(['app/app-administration'], {
    //   state: {
    //     queryParameters: queryParameters,
    //     appId: queryParameters.appId
    //   }
    // });
  }

  ngOnInit() {
    // http://petar-pc2.sistemi.corp/en-us/desktopmodules/2sxc/api/app-sys/system/apps?zoneId=2
    this.http.get(`/desktopmodules/2sxc/api/app-sys/system/apps?zoneId=${this.route.snapshot.paramMap.get('zoneId')}`)
      .subscribe((apps: App[]) => {
        this.apps = apps;
        debugger;
      });
  }

  openApp(appId: number) {
    this.router.navigate([`${this.route.snapshot.paramMap.get('zoneId')}/apps/${appId}`]);
  }

}
