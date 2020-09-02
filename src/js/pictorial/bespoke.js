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
        current: 0,
        kind: null
      },
      type: type,
      tank: 54000,
      fullness: {
        current: 0,
        max: 60
      },
      thickness: 1,
      square: {
        total: null,
        current: 0
      },
      unit: {
        fullness: null,
        square: null
      },
      hatch: null,
      full: false,
      height: {
        stage: null,
        current: null,
        points: null,
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
    this.var.innerCorner = this.var.type / ( this.var.type + 2 ) * PI;
    this.setHatch( 2 );
    this.initVertexs();
    this.updateCurrentSegment();
    this.var.unit.fullness = Math.floor( this.var.tank / this.var.fullness.max );

    /*for (var i = 0; i < this.var.segment.total; i++) {
        let  dots = [];
        let ii = ( i + 1 ) % this.var.segment.total;
        dots.push( this.array.vertex[1][ii] );
        dots.push( this.array.vertex[1][i] );
        dots.push( this.array.vertex[2][i] );
        dots.push( this.array.vertex[2][ii] );
        this.var.segment.current = i;
        let type = this.setSegmentType( dots )
        console.log( i, type);
    }*/
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
        this.var.segment.total = 17;

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

        this.var.unit.square = Math.round( this.var.square.total / this.var.fullness.max );
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
    let refill = Math.floor( barrel / this.var.unit.fullness );
    let surplus = 0;
    this.var.fullness.current += refill;
    this.var.square.current += refill * this.var.unit.square;
    this.updateCurrentSegment();

    if( this.var.fullness.current >= this.var.fullness.max ){
      this.var.fullness.current = this.var.fullness.max;
      surplus = barrel - left * this.var.unit.fullness;
      this.var.full = true;
    }

    this.updateSegmentVertices();
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
    let px = ( ( dots[0].x * dots[1].y - dots[0].y * dots[1].x ) * ( dots[2].x - dots[3].x ) -
      ( dots[2].x * dots[3].y - dots[2].y * dots[3].x ) * ( dots[0].x - dots[1].x ) ) /
      ( ( dots[0].x - dots[1].x ) * ( dots[2].y - dots[3].y ) - ( dots[0].y - dots[1].y ) * ( dots[2].x - dots[3].x ) );

    let py = ( ( dots[0].x * dots[1].y - dots[0].y * dots[1].x ) * ( dots[2].y - dots[3].y ) -
      ( dots[2].x * dots[3].y - dots[2].y * dots[3].x ) * ( dots[0].y - dots[1].y ) ) /
      ( ( dots[0].x - dots[1].x ) * ( dots[2].y - dots[3].y ) - ( dots[0].y - dots[1].y ) * ( dots[2].x - dots[3].x ) );

    return createVector( px, py );
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

    if( this.var.type == 4 ){
      bot[0].pop();
      bot[0].splice( 0, 1 );
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
    if( d <= 1 && vertexs.length == 5 ){
      let right = vertexs[2];
      let left = vertexs[3];
      let dR = dist( top[1][0].x, top[1][0].y, right.x, right.y );
      let dL = dist( top[1][0].x, top[1][0].y, left.x, left.y );

      if( dL < dR )
        bot[1][0] = left;
      else
        bot[1][0] = right;
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

  setSegmentKind( points ){
    let type = null;
    let center = this.array.vertex[0][0];

    switch ( this.var.type ) {
      case 1:
        if( ( points[0].x < center.x  && center.x > points[1].x ) ||
            ( points[0].x > center.x  && center.x < points[1].x ) )
          type = 6;
        else
          type = 4;

        if( this.var.segment.current == 0 ||
            this.var.segment.current == this.var.segment.total - 1 )
          type = 0;
        break;
      case 2:
        if( ( points[0].x < center.x  && center.x > points[1].x ) ||
            ( points[0].x > center.x  && center.x < points[1].x ) )
          type = 3;
        else
          type = 5;

        if( this.var.segment.current == 0 ||
            this.var.segment.current == this.var.segment.total - 1 )
          type = 1;
        break;
      case 3:
        let left = this.array.vertex[0][this.array.vertex[0].length - 2];
        let right = this.array.vertex[0][2];
        //console.log( points[1].x, points[0].x  )
        //console.log( Math.round( left.x ), center.x, Math.round( right.x )  )

        if( ( points[0].x < center.x  && center.x > points[1].x ) ||
            ( points[0].x > center.x  && center.x < points[1].x ) ){
              type = 6;

              if( ( points[0].x < left.x && left.x > points[1].x ) ||
                  ( points[0].x > right.x && right.x < points[1].x ) )
                type = 3;

              if( ( points[0].x > left.x && left.x > points[1].x ) ||
                  ( points[0].x > right.x && right.x > points[1].x ) )
                type = 2;
            }
        else
          type = 4;

        if( this.var.segment.current == 0 ||
            this.var.segment.current == this.var.segment.total - 1 )
          type = 1;
        break;
      case 4:
        if( ( points[0].x < center.x  && center.x > points[1].x ) ||
            ( points[0].x > center.x  && center.x < points[1].x ) )
          type = 3;
        else
          type = 5;

        if( this.var.segment.current == 0 ||
            this.var.segment.current == this.var.segment.total - 1 )
          type = 3;
        break;
    }

    return type;
  }

  vertexsFromSquare( points, square ){
    this.var.height.points = [ [], [] ];
    let h, a, ky = 1, kx = null;


    let base = Math.abs( points[0].x - points[1].x );
    let height = Math.abs( points[0].y - points[1].y );
    let topSquare = height * base / 2;

    switch ( this.var.segment.kind ) {
      case 0:
        h = Math.sqrt( square * 2 / Math.tan( this.var.innerCorner / 2 ) );
        a = h * Math.tan( this.var.innerCorner / 2 ) ;
        this.var.height.stage = 1;
        this.var.height.points[0].push( points[0] );
        this.var.height.points[1].push( createVector( points[0].x + kx * a, points[0].y + ky * h ) );
        this.var.height.points[1].push( createVector( points[0].x , points[0].y + ky * h ) );
        break;
      case 1:
        if( square < topSquare ){

          console.log(this.var.segment.current, 'top',square,topSquare)
        }
        break;
    }

    /*
    if( square < topSquare ){

      console.log(this.var.segment.current, 'top',square,topSquare)
    }
    else{
      //square -= topSquare;
      let botSquare = ( this.array.square[this.var.segment.current] - square ) / 2;
      this.var.height.stage = 3;
      this.var.height.points[0].push( points[0] );
      this.var.height.points[0].push( points[1] );


      if( leftFlag || rightFlag ){
        let a = -Math.tan( PI - this.var.innerCorner * 3 / 2 ) / 2;
        let b = Math.abs( points[0].x- points[1].x );
        let c = -botSquare;
        let hs = this.rootsThroughDiscriminant( a, b, c );
        let h = min( hs[0], hs[1] );
        let dx = botSquare  * 2 / h - b;
        this.var.height.points[1].push( createVector( points[1].x + b, points[1].y + h ) );
        this.var.height.points[1].push( createVector( points[0].x + kxx * dx, points[1].y + h ) );
      }
      else{
        h = Math.sqrt( botSquare * 2 / Math.tan( PI - this.var.innerCorner * 3 / 2 ) );
        a = h * Math.tan( PI  - this.var.innerCorner * 3 / 2 ) ;
        this.var.height.points[1].push( createVector( points[3].x + kx * a, points[3].y - ky * h ) );
        this.var.height.points[1].push( createVector( points[3].x , points[3].y - ky * h ) );
      }

      console.log(this.var.segment.current, 'bot', square, this.array.square[this.var.segment.current] )
    }
    */
  }

  rootsThroughDiscriminant( a, b, c ){
    let d = Math.sqrt( b * b - 4 * a * c );
    let x1 = ( -b + d ) / 2 / a;
    let x2 = ( -b - d ) / 2 / a;
    return [ x1, x2 ];
  }

  updateSegmentVertices(){
    let  dots = [];
    let i = this.var.segment.current;
    let ii = ( this.var.segment.current + 1 ) % this.var.segment.total;
    dots.push( this.array.vertex[1][ii] );
    dots.push( this.array.vertex[1][i] );
    dots.push( this.array.vertex[2][i] );
    dots.push( this.array.vertex[2][ii] );

    let square = this.var.square.current;
    for( let j = 0; j < i; j++ )
      square -= this.array.square[i];

    this.vertexsFromSquare( dots, square );
  }

  updateCurrentSegment(){
    let squareSum = 0;

    for( let i = 0; i < this.array.square.length; i++ ){
      squareSum += this.array.square[i];

      if( this.var.square.current < squareSum ){
        let  dots = [];
        let ii = ( i + 1 ) % this.var.segment.total;
        dots.push( this.array.vertex[1][ii] );
        dots.push( this.array.vertex[1][i] );
        dots.push( this.array.vertex[2][i] );
        dots.push( this.array.vertex[2][ii] );
        this.var.segment.current = i;
        this.var.segment.kind = this.setSegmentKind( dots );
        return;
      }
    }
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
        for( let i = 0; i < this.array.vertex[0].length; i++ ){
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
        let pointA, pointB, pointC, pointD;
        let half = this.array.vertex[0].length / 2;

        for( let i = 0; i < this.var.segment.current; i++ ){//this.var.segment.current
          let ii = ( i + 1 ) % this.array.vertex[1].length;

          fill( colorMax / ( this.array.vertex[1].length - 1 ) * i, colorMax, colorMax  * 0.5 );
          stroke( colorMax / ( this.array.vertex[1].length - 1 ) * i, colorMax, colorMax  * 0.5  );//green

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

        if( this.var.height.stage != 0 ){
          let i = this.var.segment.current;
          let ii = ( this.var.segment.current + 1 ) % this.var.segment.total;
          pointA = this.var.height.points[0][0];
          pointB = this.var.height.points[1][0];
          pointC = this.var.height.points[1][1];
          pointD = this.var.height.points[0][1];

          //triangle( pointA.x, pointA.y, pointB.x, pointB.y, pointC.x, pointC.y );
          fill('red')
          //triangle( pointA.x, pointA.y, pointB.x, pointB.y, pointD.x, pointD.y );
          fill('red')
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
