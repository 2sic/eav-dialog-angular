import { } from 'google-maps';

import { EavExperimentalInputField, ElementEventListener } from '../shared/models';
import { buildTemplate, parseLatLng, stringifyLatLng } from '../shared/helpers';
import { defaultCoordinates } from '../shared/constants';
import * as template from './main.html';
import * as styles from './main.css';
import { FieldMaskService } from '../../../shared/field-mask.service';

class FieldCustomGps extends EavExperimentalInputField<string> {
  eventListeners: ElementEventListener[];
  fieldInitialized: boolean;
  addressMaskService: FieldMaskService;
  geocoder: google.maps.Geocoder;
  iconSearch: HTMLAnchorElement;
  latFieldName: string;
  latInput: HTMLInputElement;
  lngFieldName: string;
  lngInput: HTMLInputElement;
  map: google.maps.Map;
  mapApiUrl: string;
  mapContainer: HTMLDivElement;
  marker: google.maps.Marker;

  constructor() {
    super();
    console.log('FieldCustomGps constructor called');
    const mapApiKey = 'AIzaSyDPhnNKpEg8FmY8nooE7Zwnue6SusxEnHE';
    this.mapApiUrl = `https://maps.googleapis.com/maps/api/js?key=${mapApiKey}`;
    this.fieldInitialized = false;
    this.eventListeners = [];
  }

  connectedCallback() {
    console.log('FieldCustomGps connectedCallback called');
    // spm prevents connectedCallback from being called more than once. Don't know if it's necessary
    // https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-conformance
    if (this.fieldInitialized) { return; }
    this.fieldInitialized = true;

    this.innerHTML = buildTemplate(template, styles);
    this.latInput = this.querySelector('#lat');
    this.lngInput = this.querySelector('#lng');
    const addressMaskContainer = <HTMLDivElement>this.querySelector('#address-mask-container');
    this.iconSearch = this.querySelector('#icon-search');
    const formattedAddressContainer = <HTMLSpanElement>this.querySelector('#formatted-address-container');
    this.mapContainer = this.querySelector('#map');

    const allInputNames = this.experimental.allInputTypeNames.map(inputType => inputType.name);
    if (allInputNames.indexOf(this.connector.field.settings.LatField) !== -1) {
      this.latFieldName = this.connector.field.settings.LatField;
    }
    if (allInputNames.indexOf(this.connector.field.settings.LongField) !== -1) {
      this.lngFieldName = this.connector.field.settings.LongField;
    }

    const addressMask = this.connector.field.settings.AddressMask || this.connector.field.settings['Address Mask'];
    this.addressMaskService = new FieldMaskService(addressMask, this.experimental.formGroup.controls, null, null);
    console.log('FieldCustomGps addressMask:', addressMask);
    if (addressMask) {
      addressMaskContainer.classList.remove('hidden');
      formattedAddressContainer.innerText = this.addressMaskService.resolve();
    }

    const mapScriptLoaded = !!(window as any).google;
    if (mapScriptLoaded) {
      this.mapScriptLoaded();
    } else {
      const script = document.createElement('script');
      script.src = this.mapApiUrl;
      script.onload = this.mapScriptLoaded.bind(this);
      this.appendChild(script);
    }
  }

  private mapScriptLoaded() {
    console.log('FieldCustomGps mapScriptLoaded called');
    this.map = new google.maps.Map(this.mapContainer, { zoom: 15, center: defaultCoordinates });
    this.marker = new google.maps.Marker({ position: defaultCoordinates, map: this.map, draggable: true });
    this.geocoder = new google.maps.Geocoder();

    // set initial values
    if (!this.connector.data.value) {
      this.updateHtml(defaultCoordinates);
    } else {
      this.updateHtml(parseLatLng(this.connector.data.value));
    }

    // listen to inputs, iconSearch and marker. Update inputs, map, marker and form
    const onLatLngInputChangeBound = this.onLatLngInputChange.bind(this);
    this.latInput.addEventListener('change', onLatLngInputChangeBound);
    this.lngInput.addEventListener('change', onLatLngInputChangeBound);

    const autoSelectBound = this.autoSelect.bind(this);
    this.iconSearch.addEventListener('click', autoSelectBound);

    this.eventListeners.push(
      { element: this.latInput, type: 'change', listener: onLatLngInputChangeBound },
      { element: this.lngInput, type: 'change', listener: onLatLngInputChangeBound },
      { element: this.iconSearch, type: 'click', listener: autoSelectBound },
    );

    this.marker.addListener('dragend', this.onMarkerDragend.bind(this));
  }

  private updateHtml(latLng: google.maps.LatLngLiteral) {
    this.latInput.value = latLng.lat ? latLng.lat.toString() : '';
    this.lngInput.value = latLng.lng ? latLng.lng.toString() : '';
    this.map.setCenter(latLng);
    this.marker.setPosition(latLng);
  }

  private updateForm(latLng: google.maps.LatLngLiteral) {
    this.connector.data.update(stringifyLatLng(latLng));
    if (this.latFieldName) {
      this.experimental.updateField(this.latFieldName, latLng.lat);
    }
    if (this.lngFieldName) {
      this.experimental.updateField(this.lngFieldName, latLng.lng);
    }
  }

  private onLatLngInputChange() {
    console.log('FieldCustomGps input changed');
    const latLng: google.maps.LatLngLiteral = {
      lat: this.latInput.value.length > 0 ? parseFloat(this.latInput.value) : null,
      lng: this.lngInput.value.length > 0 ? parseFloat(this.lngInput.value) : null,
    };
    this.updateHtml(latLng);
    this.updateForm(latLng);
  }

  private autoSelect() {
    console.log('FieldCustomGps geocoder called');
    const address = this.addressMaskService.resolve();
    this.geocoder.geocode({
      address: address
    }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        const result = results[0].geometry.location;
        const latLng: google.maps.LatLngLiteral = {
          lat: result.lat(),
          lng: result.lng(),
        };
        this.updateHtml(latLng);
        this.updateForm(latLng);
      } else {
        alert(`Could not locate address: ${address}`);
      }
    });
  }

  private onMarkerDragend(event: google.maps.MouseEvent) {
    console.log('FieldCustomGps marker changed');
    const latLng: google.maps.LatLngLiteral = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    this.updateHtml(latLng);
    this.updateForm(latLng);
  }

  disconnectedCallback() {
    console.log('FieldCustomGps disconnectedCallback called');
    if (!!(window as any).google) {
      google.maps.event.clearInstanceListeners(this.marker);
      google.maps.event.clearInstanceListeners(this.map);
    }

    this.eventListeners.forEach(eventListener => {
      const element = eventListener.element;
      const type = eventListener.type;
      const listener = eventListener.listener;
      element.removeEventListener(type, listener);
    });
  }
}

customElements.define('field-custom-gps', FieldCustomGps);