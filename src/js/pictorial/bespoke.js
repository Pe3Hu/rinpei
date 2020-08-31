//
class bespoke{
  constructor( index, type, center, a, tank ){
    this.const = {
      index: index,
      center: center,
      a: cellSize * a
    };
    this.var = {
      segment: {
        total: null,
        current: null
      },
      type: type,
      tank: 5400,
      fullness: {
        current: 0,
        max: 60
      },
      thickness: 1,
      square: {
        total: null,
        current: null
      },
      unit: null,
      hatch: null,
      full: false,
      height: {
        stage: null,
        current: null,
        pointA: null,
        pointB: null
      },
      innerCorner: null
    };
    this.array = {
      vertex: [],
      square: []
    };

    this.init();
  }

  init(){
    this.var.unit = Math.floor( this.var.tank / this.var.fullness.max );
    this.var.innerCorner = this.var.type / ( this.var.type + 2 ) * PI;
    this.setHatch( 2 );
    this.initVertexs();
  }

  initVertexs(){
    let n = this.var.type + 2;
    let angle = PI * 2 / n;
    let l = this.const.a;

    switch ( this.var.hatch ) {
      case 0:
        if( this.var.type == 0 )
          return;

        this.array.vertex = [ [], [] ];

        for( let i = 0; i < n; i++ ){
           let vertex = this.const.center.copy();
           let x = Math.sin( angle * i );
           let y = -Math.cos( angle * i );
           let addVec = createVector( x * l, y * l );
           vertex.add( addVec );
           this.array.vertex[0].push( vertex.copy() );
           vertex = this.const.center.copy();
           addVec = createVector( x, y );
           this.array.vertex[1].push( addVec.copy() );
         }
        break;
      case 1:
        this.array.vertex = [];
        this.var.segment.total = n;
        let vertex = this.const.center.copy();
        vertex.y -= l;
        this.array.vertex.push( vertex.copy() );
        //side length of a regular polygon
        let a = l * 2 * Math.sin( PI / n );
        angle = PI / n;

        for( let i = 0; i < n; i++ ){
            let addVec = createVector( Math.sin( PI / 2 - angle  ) * a / this.var.segment.total, Math.cos( PI / 2 - angle ) * a / this.var.segment.total );
            for( let j = 0; j < this.var.segment.total; j++ ){
              vertex.add( addVec );
              this.array.vertex.push( vertex.copy() );
            }
            angle += PI * 2 / n;
        }
        //remove unnecessary repeat
        this.array.vertex.pop();
        this.var.fullness.max = n * this.var.segment.total;
        break;
      case 2:
        this.array.vertex = [ [], [], [], [] ];
        this.var.fullness.max = 100;
        this.var.segment.total = 5;

        for( let i = 0; i < n; i++ ){
          let vertex = this.const.center.copy();
          let x = Math.sin( angle * i );
          let y = -Math.cos( angle * i );
          let addVec = createVector( x * l, y * l );
          vertex.add( addVec );
          this.array.vertex[0].push( vertex.copy() );
        }
        //second & last vertex to draw the first and last column
        //only for 7 > n > 2
        this.array.vertex[3].push( this.array.vertex[0][1].copy() );
        this.array.vertex[3].push( this.array.vertex[0][this.array.vertex[0].length - 1].copy() );

        let d = ( this.array.vertex[3][0].x - this.array.vertex[3][1].x ) / this.var.segment.total;
        let x = this.array.vertex[3][1].x;
        let y = null;

        for( let i = 0; i < this.var.segment.total + 1; i++ ){
          switch ( this.var.type ){
            case 1:
            case 2:
            case 3:
            case 4:
              let arr = this.bestLine( this.array.vertex[0], x, y );
              this.array.vertex[1].push( arr[0] );
              this.array.vertex[2].push( arr[1] );
              y = null;
              break;
          }

          x += d;
        }

        this.var.square.total = 0;

        for( let i = 0; i < this.array.vertex[1].length - 1; i++ ){
          let ii = ( i + 1 ) % this.array.vertex[1].length;
          let arr = [];
          let square = 0;
          arr.push( this.array.vertex[1][ii] );
          arr.push( this.array.vertex[2][i] );
          arr.push( this.array.vertex[2][ii] );
          square += this.gaussArea( arr );
          arr.pop();
          arr.push( this.array.vertex[1][i] );
          square += this.gaussArea( arr );
          this.array.square.push( square );
          this.var.square.total += square;
        }

        this.var.unit = Math.round( this.var.square.total / this.var.fullness.max );
        this.var.height.current = 0;
        this.var.height.stage = 0;
        break;
    }
  }

  setHatch( hatch ){
    this.var.hatch = hatch;
  }

  fillTank( barrel ){
    if( this.var.full )
      return;

    let left = this.var.fullness.max - this.var.fullness.current;
    let refill = Math.floor( barrel / this.var.unit );
    let surplus = 0;
    this.var.fullness.current += refill;

    if( this.var.fullness.current >= this.var.fullness.max ){
      this.var.fullness.current = this.var.fullness.max;
      surplus = barrel - left * this.var.unit;
      this.var.full = true;
    }
    //console.log( surplus, this.var.unit )
  }

  twoDotsLine( dots, x, y ){
    if( x == null && y == null )
      return;

    let a = dots[0].y - dots[1].y;
    let b = dots[1].x - dots[0].x;
    let c = dots[0].x * dots[1].y - dots[1].x * dots[0].y;

    if( x == null )
      x = ( c  + b * y ) / -a;
    if( y == null )
      y = ( c  + a * x ) / -b;

    return createVector( Math.round( x ), Math.round( y ) );
  }

  twoLine4Dots( dots ){
    let px = ( dots[0].x * dots[1].y );
  }

  bestLine( vertexs, x ){
    x = Math.round( x );
    let top = [ [], [] ];
    let bot = [ [], [] ];

    for( let i = 0; i < vertexs.length; i++ ){
      let ii = ( i + 1 ) % vertexs.length;
      let y = null;

      if( i == 0 || ii == 0 )
        top[0].push( this.twoDotsLine( [ vertexs[i], vertexs[ii] ], x, y ) );
      else
        bot[0].push( this.twoDotsLine( [ vertexs[i], vertexs[ii] ], x, y ) );

    }

    let max, index;
    max = top[0][0].y;
    index = 0;

    for( let j = 0; j < top[0].length; j++ )
      if( top[0][j].y > max ){
        max = top[0][j].y;
        index = j;
      }

    top[1].push( top[0][index] );
    max = bot[0][0].y;
    index = 0;

    for( let j = 0; j < bot[0].length; j++ )
      if( bot[0][j].y  < max ){
        max = bot[0][j].y;
        index = j;
      }

    bot[1].push( bot[0][index] );


    let d = dist( top[1][0].x, top[1][0].y, bot[1][0].x, bot[1][0].y );
    if( d <= 1  ){
      let left = this.twoDotsLine( [ vertexs[i], vertexs[ii] ], x, y )
    }
    return  [ top[1][0], bot[1][0] ];
  }

  gaussArea( arr ){
    let area1 = 0, area2 = 0;
    for( let i = 0; i < arr.length; i++ ){
      let ii = ( i + 1 ) % arr.length;

      area1 += arr[i].x * arr[ii].y;
      area2 += arr[i].y * arr[ii].x;
    }
    return Math.abs( area1 - area2 ) / 2;
  }

  vertexsFromSquare( pointA, pointB, pointC, pointD, square ){
    let base = Math.abs( pointA.x - pointB.x );
    let height = Math.abs( pointA.y - pointB.y );
    let topSquare = height * base / 2;
    let h;
    if( square < topSquare ){
      h = square * 2 / base;
      this.var.height.current = h;
      this.var.height.stage = 1;
      this.var.height.pointA;
    }
    //height = square * 2 / base;


    let maxSquare = this.gaussArea( [ pointA, pointB, pointC ] ) + this.gaussArea( [ pointA, pointD, pointC ] );
  }

  draw(){
    let txt;
    let koef = this.const.a / this.var.fullness.max * this.var.fullness.current;
    let l = this.const.a;
    stroke( 'green' );
    fill( 'green' );

    switch ( this.var.hatch ) {
      case 0:
        if( this.var.type == 0 )
          ellipse( this.const.center.x, this.const.center.y, this.const.a );

        for( let i = 0; i < this.array.vertex[0].length; i++ ){
          let ii = ( i + 1 ) % this.array.vertex[0].length;

          strokeWeight(2);
          line( this.array.vertex[0][i].x, this.array.vertex[0][i].y,
            this.array.vertex[0][ii].x, this.array.vertex[0][ii].y );
          strokeWeight(1);

          triangle(
            this.const.center.x + this.array.vertex[1][i].x * koef, this.const.center.y + this.array.vertex[1][i].y * koef,
            this.const.center.x + this.array.vertex[1][ii].x * koef, this.const.center.y + this.array.vertex[1][ii].y * koef,
            this.const.center.x, this.const.center.y
          );
        }


        break;
      case 1:
        for( let i = 0; i < this.array.vertex.length; i+=this.var.segment.total ){
          let ii = ( i + this.var.segment.total ) % this.array.vertex.length;

          strokeWeight(2);
          line( this.array.vertex[i].x, this.array.vertex[i].y,
            this.array.vertex[ii].x, this.array.vertex[ii].y );
          strokeWeight(1);
        }

        for( let i = 0; i < this.var.fullness.current; i++ ){
          let ii = ( i + 1 ) % this.array.vertex.length;

          triangle(
            this.array.vertex[i].x, this.array.vertex[i].y,
            this.array.vertex[ii].x, this.array.vertex[ii].y,
            this.const.center.x, this.const.center.y
          );
        }
        break;
      case 2:
        for( let i = 0; i < this.array.vertex[0].length - 1; i++ ){
          let ii = ( i + 1 ) % this.array.vertex[0].length;

          strokeWeight(2);
          line( this.array.vertex[0][i].x, this.array.vertex[0][i].y,
            this.array.vertex[0][ii].x, this.array.vertex[0][ii].y );
          strokeWeight(1);
        }

        strokeWeight(2);
        stroke('red')
        line( this.array.vertex[3][0].x, this.const.center.y + l,
          this.array.vertex[3][1].x, this.const.center.y + l );
        line( this.array.vertex[3][0].x, this.array.vertex[0][0].y,
          this.array.vertex[3][1].x, this.array.vertex[0][0].y );

        strokeWeight(0.5)
        stroke('green');
        let pointA, pointB, pointC, pointD;
        let half = this.array.vertex[0].length / 2;

        for( let i = 0; i < this.var.segment.total; i++ ){
          let ii = ( i + 1 ) % this.array.vertex[1].length;

          pointA = this.array.vertex[1][ii];
          pointB = this.array.vertex[1][i];
          pointC = this.array.vertex[2][i];
          pointD = this.array.vertex[2][ii];

          triangle( pointA.x, pointA.y, pointB.x, pointB.y, pointC.x, pointC.y );
          triangle( pointA.x, pointA.y, pointC.x, pointC.y, pointD.x, pointD.y );

          if( this.var.segment.total % 2 == 1 && i == Math.floor( this.var.segment.total / 2 ) ){
            pointA = this.array.vertex[0][0];
            pointB = this.array.vertex[1][i];
            pointC = this.array.vertex[1][ii];
            triangle( pointA.x, pointA.y, pointB.x, pointB.y, pointC.x, pointC.y );

            if( this.var.type % 2 == 0 ){
              let half = this.array.vertex[0].length / 2;
              pointA = this.array.vertex[0][half];
              pointB = this.array.vertex[2][i];
              pointC = this.array.vertex[2][ii];
              triangle( pointA.x, pointA.y, pointB.x, pointB.y, pointC.x, pointC.y );
            }
          }
        }
        break;
      }

    noStroke();
    fill('black')
    ellipse( this.const.center.x, this.const.center.y, this.const.a/6 );
  }
}

//begin and end
/*
bestLine( vertexs, begin, end ){
  let top = [ [], [], [] ];
  let bot = [ [], [], [] ];

  for( let i = 0; i < vertexs.length; i++ ){
    let ii = ( i + 1 ) % vertexs.length;
    let y = null;

    if( i == 0 || ii == 0 ){
      top[0].push( twoDotsLine( [ vertexs[i], vertexs[ii] ], begin.x, y );
      top[1].push( twoDotsLine( [ vertexs[i], vertexs[ii] ], end.x, y );
    }
    else{
      bot[0].push( twoDotsLine( [ vertexs[i], vertexs[ii] ], begin.x, y );
      bot[1].push( twoDotsLine( [ vertexs[i], vertexs[ii] ], end.x, y );
    }
  }

  let criterion, max, index;

  for( let i = 0; i < 2; i++ ){
    criterion = -1;
    max = top[i][0].y * criterion;
    index = 0;

    for( let j = 0; j < top[i].length; j++ )
      if( top[i][j].y * criterion > max ){
        max = top[i][j].y * criterion;
        index = j;
      }

    top[2].push( top[i][index] );
    criterion = 1;
    max = bot[i][0].y * criterion;
    index = 0;

    for( let j = 0; j < bot[i].length; j++ )
      if( bot[i][j].y * criterion > max ){
        max = bot[i][j].y * criterion;
        index = j;
      }

    bot[2].push( top[i][index] );
  }

  return  [ top[2], bot[2] ] ;
}
*/
