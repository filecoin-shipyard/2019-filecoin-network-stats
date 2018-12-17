import * as React from 'react';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import './AnimatedMap.scss';
import bemify from '../utils/bemify';

const b = bemify('animated-map');

interface CityData {
  lat: number,
  long: number,
  name: string
}

const cityLocs = [
  {
    lat: 48.8567,
    long: 2.3510,
    name: 'Paris',
  },
  {
    lat: 51.507351,
    long: -0.127758,
    name: 'London',
  },
  {
    lat: 34.3,
    long: -118.15,
    name: 'Los Angeles',
  },
  {
    lat: 43.8163,
    long: -79.4287,
    name: 'Toronto',
  },
  {
    lat: 55.755825,
    long: 37.617298,
    name: 'Moscow',
  },
  {
    lat: 39.904202,
    long: 116.407394,
    name: 'Beijing',
  },
  {
    lat: -33.868820,
    long: 151.209290,
    name: 'Sydney',
  },
  {
    lat: -26.204103,
    long: 28.047304,
    name: 'Johannesburg',
  },
  {
    lat: 40.712776,
    long: -74.005974,
    name: 'New York',
  },
  {
    lat: 35.689487,
    long: 139.691711,
    name: 'Tokyo',
  },
  {
    lat: -22.906847,
    long: -43.172897,
    name: 'Rio de Janeiro',
  },
  {
    lat: 28.704060,
    long: 77.102493,
    name: 'Delhi',
  },
];

export default class AnimatedMap extends React.Component<{}, {}> {
  private chart: am4maps.MapChart | null = null;

  private mounted: boolean = false;

  componentDidMount = () => setTimeout(() => {
    this.mounted = true;
    am4core.useTheme(am4themes_animated);
    this.chart = am4core.create('chartdiv', am4maps.MapChart);
    this.chart.geodata = am4geodata_worldLow;
    this.chart.projection = new am4maps.projections.Miller();
    this.chart.homeZoomLevel = 1.4;

    const polygonSeries = this.chart.series.push(new am4maps.MapPolygonSeries());
    polygonSeries.useGeodata = true;
    polygonSeries.mapPolygons.template.fill = am4core.color('#b9f8f3').lighten(0.4);
    polygonSeries.exclude = ['AQ'];

    const cityPoints = this.chart.series.push(new am4maps.MapImageSeries());
    cityPoints.mapImages.template.nonScaling = true;

    const cityPoint = cityPoints.mapImages.template.createChild(am4core.Circle);
    cityPoint.radius = 6;
    cityPoint.fill = am4core.color('#12c4aa');
    cityPoint.strokeWidth = 2;
    cityPoint.stroke = am4core.color('#fff');

    const lineSeries = this.chart.series.push(new am4maps.MapArcSeries());
    lineSeries.mapLines.template.line.strokeWidth = 1;
    lineSeries.mapLines.template.line.strokeOpacity = 0;
    lineSeries.mapLines.template.line.stroke = am4core.color('#45b9e6');
    lineSeries.mapLines.template.line.nonScalingStroke = true;
    lineSeries.zIndex = 10;

    function addCity (data: CityData) {
      let city = cityPoints.mapImages.create();
      city.latitude = data.lat;
      city.longitude = data.long;
      city.tooltipText = data.name;
      return city;
    }

    function addLine (from: am4maps.MapImage, to: am4maps.MapImage) {
      let line = lineSeries.mapLines.create();
      line.imagesToConnect = [from, to];
      line.line.controlPointDistance = -0.1;
      return line;
    }

    const cityInstances = cityLocs.map((city: CityData) => addCity(city));

    for (let i = 0; i < cityInstances.length; i++) {
      for (let j = 0; j < cityInstances.length; j++) {
        if (i === j) {
          continue;
        }

        const from = cityInstances[i];
        const to = cityInstances[j];

        addLine(from, to);
      }
    }

    let direction = 1;
    const lineCount = lineSeries.mapLines.length;

    const animate = (line: number) => {
      if (!this.mounted) {
        return;
      }

      const mapLine = lineSeries.mapLines.getIndex(line);
      const lineObj = mapLine.lineObjects.create();
      lineObj.position = 0;
      lineObj.width = 48;
      lineObj.height = 48;

      lineObj.adapter.add('scale', (scale, target) => {
        return 0.5 * (1 - (Math.abs(0.5 - target.position)));
      });

      const spriteImage = lineObj.createChild(am4core.Circle);
      spriteImage.radius = 6;
      spriteImage.fill = am4core.color('#45b9e6');
      spriteImage.strokeWidth = 0;

      // Set up animation
      let from, to;
      if (direction == 1) {
        from = 0;
        to = 1;
      } else {
        from = 1;
        to = 0;
      }

      const lineAnim = mapLine.line.animate({
        from: 0,
        to: 0.5,
        property: 'strokeOpacity',
      }, 500, am4core.ease.linear);
      lineAnim.events.on('animationended', () => setTimeout(() => mapLine.line.animate({
        from: 0.5,
        to: 0,
        property: 'strokeOpacity',
      }, 500), 2000));


      const start = lineSeries.mapLines.getIndex(line).imagesToConnect[from] as am4maps.MapImage;
      start.animate({
        from: 6,
        to: 12,
        property: 'radius',
      }, 500, am4core.ease.linear);

      // Start the animation
      let animation = lineObj.animate({
        from,
        to,
        property: 'position',
      }, 1500, am4core.ease.linear);
      animation.events.on('animationended', () => {
        spriteImage.dispose();
        animate(Math.floor(lineCount * Math.random()));
      });
    };

    let animCount = 15;

    const anim = () => {
      if (animCount === 0) {
        return;
      }

      animate(Math.floor(lineCount * Math.random()));
      setTimeout(anim, 1500 * Math.random());
      animCount--;
    };

    anim();
  }, 0);

  componentWillUnmount () {
    this.mounted = false;

    if (this.chart) {
      setTimeout(() => this.chart.dispose(), 0);
    }
  }

  render () {
    return (
      <div id="chartdiv" className={b('chart')} />
    );
  }
}