import { Component, OnInit, Inject, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import OlMap from '../../node_modules/ol/Map';
import OlLayer from '../../node_modules/ol/layer/Layer';
import OlTileLayer from '../../node_modules/ol/layer/Tile';
import OlView from '../../node_modules/ol/View';
import OlPoint from '../../node_modules/ol/geom/Point';
import { FormControl, FormGroup } from '@angular/forms';
import OlFeature from '../../node_modules/ol/Feature';
import GeoJSON from 'ol/format/GeoJSON.js';
import { Draw, Modify, Snap } from '../../node_modules/ol/interaction';
import { Tile as TileLayer, Vector as VectorLayer } from '../../node_modules/ol/layer.js';
import { OSM, Vector as VectorSource } from '../../node_modules/ol/source.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from '../../node_modules/ol/style.js';
import { CoordinancesService } from '../app/app.service';
import { Point } from '../../node_modules/ol/geom';

import { Coordinances } from '../app/coordiances';
import { first } from 'rxjs/operators';
import { pipe } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})



export class AppComponent implements OnInit {

  form = new FormGroup({
    'switch': new FormControl('draw')
  });

  expandFilter = false;

  mapRef: ElementRef;
  title = 'openLay';
  map: OlMap;
  point: Point;
  source: any;
  vector: any;
  layer: OlTileLayer;
  view: OlView;
  draw: Draw;
  snap: Snap;
  modify: Modify;
  raster: TileLayer;
  document: any;
  coorsAray: Coordinances[] = [];


  CoordinatedDrawn: Array<Object> = [];
  Vectors: Array<Object> = [
    { type: 'Point', name: 'Point' },
    { type: 'LineString', name: 'LineString' },
    { type: 'Polygon', name: 'Polygon' },
    { type: 'Circle', name: 'Circle' }
  ];

  selectedType = this.Vectors[0];
  typeCoordinance = this.Vectors[0];
  addInteractionsFunction: any;


  constructor(@Inject(DOCUMENT) document, private coorServ: CoordinancesService) {
    this.document = document;

  }
  ngOnInit() {


    this.coorServ.getCoors().pipe(first()).subscribe(coors => {
      this.coorsAray = coors;
      console.log(this.coorsAray);
    });

    this.initMap();
    /**
     * Handle change event.
     */

    this.map.on('click', (evt) => {
      const coordinates = {
        pressed: 0,
        long: '',
        lat: '',
        type: ''
      };
      console.log(evt);
      switch (this.selectedType['type']) {
        case ('Point'):
          {
            console.log('Ponts added ');

            coordinates.long = evt.coordinate[0];
            coordinates.lat = evt.coordinate[1];
            coordinates.pressed += this.CoordinatedDrawn.length + 1;
            coordinates.type = 'Point';
            this.CoordinatedDrawn.push(coordinates);

            console.log(this.CoordinatedDrawn);
            break;

          } case ('LineString'): {
            console.log(' LIne string');
          }
      }


    });


    const cursorHoverStyle = 'pointer';
    const target = this.map.getTarget();
    const jTarget = typeof target === 'string' ? ('#' + target) : (target);
    this.map.on('pointermove', function (evt) {
      // console.log(jTarget);
      this.mapRef = document.getElementById('map');
      // console.log(this.mapRef)
      const mouseCoordInMapPixels = [evt.originalEvent.offsetX, evt.originalEvent.offsetY];

      // detect feature at mouse coords

      const hit = this.forEachFeatureAtPixel(mouseCoordInMapPixels, function (feature, layer) {
        return true;
      });
      if (hit) {
        // console.log('hit', hit);
        this.mapRef.style.cssText = 'cursor : pointer; background: transparent ';
      } else {
        // console.log(this.mapRef);
        this.mapRef.style.cssText = ' cursor : ""; ';
      }
    });

  }

  initMap() {
    // SOURCE
    this.source = new VectorSource();


    // Tile Layer creates a map using a module:ol/layer/Tile
    this.raster = new TileLayer({
      source: new OSM() // display module:ol/source/OSM~OSM OSM data 
    });

    // VECTORS
    this.vector = new VectorLayer({
      name: 'vector1',
      source: this.source,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: '#ffcc33',
          width: 2
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33'
          })
        })
      })
    });

    // MAP
    this.map = new OlMap({
      layers: [this.raster, this.vector],
      target: 'map',
      view: new OlView({
        center: ([20.41, 48.82]),
        zoom: 4
      })
    });


    // Modify
    this.modify = new Modify({ source: this.source });

    this.map.addInteraction(this.modify);
    this.addInteractions();
  }

  addInteractions() {

    // console.log(this.source);
    // console.log(this.selectedType);
    this.draw = new Draw({
      source: this.source,
      type: this.selectedType['type']
    });
    this.map.addInteraction(this.draw);
    this.snap = new Snap({
      source: this.source
    });
    this.map.addInteraction(this.snap);
    // console.log(this.draw, this.map);
  }


  changeType(event) {
    // console.log(event);
    this.selectedType = event;
    this.typeCoordinance = event;
    this.map.removeInteraction(this.draw);
    this.map.removeInteraction(this.snap);
    // console.log(' CHANGED TYPE ');

    this.addInteractions();
  }


  radioChange() {

    this.CoordinatedDrawn = [];
    console.log(this.form.value.switch);
    if (this.form.value.switch === 'draw') {
      this.changeType(this.selectedType);
    } else {

      console.log(this.form.value);
      this.map.removeInteraction(this.draw);
      this.map.removeInteraction(this.snap);
    }
  }


  Refresh() {
    // console.log(this.map.getLayers());
    const features = this.vector.getSource().getFeatures();
    this.CoordinatedDrawn = [];
    features.forEach((feature) => {
      this.vector.getSource().removeFeature(feature);
    });



  }



  drawCoordinates() {

    const image = new CircleStyle({
      radius: 6,
      fill: null,
      stroke: new Stroke({ color: 'yellow', width: 2 })
    });

    const styles = {
      'Point': new Style({
        image: image
      })
    };


    const styleFunction = function (feature) {
      return styles[feature.getGeometry().getType()];
    };
    console.log("draww", this.coorsAray);
    const coordinates = new VectorSource();



    // const vectorSource = new VectorSource({
    //   features: (new GeoJSON()).readFeatures(geojsonObject)
    // });
    const geojsonObject = {
      'type': 'FeatureCollection',
      'crs': {
        'type': 'name',
        'properties': {
          'name': 'EPSG:3857'
        }
      },
      'features': []
    };

    const FeatureArray = [];
    this.coorsAray['coords'].forEach((coor) => {
      console.log(coor.long, coor.lat);
      const featureobj = {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [coor.long, coor.lat]
        }
      };
      FeatureArray.push(featureobj);
    });


    geojsonObject['features'] = FeatureArray;

    // const geojsonObject = {
    //   'type': 'FeatureCollection',
    //   'crs': {
    //     'type': 'name',
    //     'properties': {
    //       'name': 'EPSG:3857'
    //     }
    //   },
    //   'features': [
    //     {
    //       'type': 'Feature',
    //       'geometry': {
    //         'type': 'Point',
    //         'coordinates': [34, 56]
    //       }
    //     },
    //     {
    //       'type': 'Feature',
    //       'geometry': {
    //         'type': 'Point',
    //         'coordinates': [67, 40]
    //       }
    //     },
    //     {
    //       'type': 'Feature',
    //       'geometry': {
    //         'type': 'Point',
    //         'coordinates': [55, 76]
    //       }
    //     }

    //   ]
    // };

    const vectorSource = new VectorSource({
      features: (new GeoJSON()).readFeatures(geojsonObject)
    });

    console.log(vectorSource);


    // vectorSource.addFeature(new OlFeature(new Point([coor.long, coor.lat], 1e6)));

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: styleFunction
    });

    this.map = new OlMap({
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      target: 'map',
      view: new OlView({
        center: ([100.41, 48.82]),
        zoom: 4
      })
    });



    this.point = this.CoordinatedDrawn;



  }
}


