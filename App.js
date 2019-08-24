import React from 'react';
import { Image,Platform,Modal,Alert,StyleSheet, Text, View, Button, Linking,TextInput,TouchableOpacity } from 'react-native';
import MapView ,{  Marker ,Polyline} from 'react-native-maps';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
// import Polyline from '@mapbox/polyline';






const GOOGLE_API_KEY= 'AIzaSyC8ntRim3aadGbQOeRdN-hhVAQxhYV571c';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});
const INT_MAX=2147483647;
// const og=[[0,20,42,25],[20,0,30,34],[42,30,0,10],[25,34,10,0]];
export default class App extends React.Component {
  constructor(props) {
    super(props);
  this.state = {
    names: [
         {
            id: 0,
            name: '1. Select the delivery points by touching the locations on map.',
         },
         {
            id: 1,
            name: '2. After selecting locations click on the arrow button and then click on done.',
         },
         {
            id: 2,
            name: '3.After some time you will see a optimized travel route , again click on arrow button and the navigation button for navigation.',
         }
      ],
    mapRegion: null,
    lastLat: null,
    lastLong: null,
    markers :[],
    og : [[],[],[],[],[],[],[],[],[],[],[]],
    coord:[],
    sorted:[],
    done: false,
    flag:false,
    weight: null,
    toggle:false,
    Alert_Visibility: false,
    view_toggle:false,
    view2_toggle:false,

    };

  }
  clear(){
    this.setState({
    markers :[],
    og : [[],[],[],[],[],[],[],[],[],[],[],[]],
    coord:[],
    sorted:[],
    done: false,
    flag:false})
  }
  as(){
    this.setState(state=>(
      state.og[0][0]=1
    ))
    console.log(this.state.og);
  }
  async loop2(){
    var i=0;
    await this.setState(state=>(
      state.og[this.state.coord.length-1][this.state.coord.length-1]=0
    ));
    for( i=0;i<this.state.coord.length-1;i++){
      await this.getDistance(i);
    };
    if(i==this.state.coord.length-1 ){
    this.setState({flag:true});}



  }
  async getDistance(i){
    let str = this.state.coord[i].longitude+','+this.state.coord[i].latitude;
    for(var j=i+1;j<this.state.coord.length;j++)
    {
      if(j==i)
      {
        continue;
      }
      else{
        str=str+';'+this.state.coord[j].longitude+','+this.state.coord[j].latitude;
      }
    }
    let url='https://apis.mapmyindia.com/advancedmaps/v1/51d16oycxqv5k2rp9u3cjnzawb1j6mta/distance_matrix/driving/'+str+'?';
       let fetchResult = await fetch(url); // call API
       let Result = await fetchResult.json();
       console.log(i);
       console.log(Result.results.distances[0].length);
       for(var z=0;z<Result.results.distances[0].length;z++){
         this.setState(state=>(
           state.og[i][z+i]=Result.results.distances[0][z],
           state.og[z+i][i]=Result.results.distances[0][z]
         ))
       }

      //  this.jsondist(Result)
      //  console.log(url);
      //  console.log(i);
      //  console.log(Result);
  }

  async loop(){
    this.setState({
      coord: [{latitude:this.state.lastLat,longitude:this.state.lastLong}]
    })

    for(var i=1;i<this.state.markers.length+1;i++){
      console.log('hi');
      this.In(i);
    }
}
async final(){
  let str='/';
  console.log(this.state.sorted.length);
  for(var i=0;i<this.state.sorted.length ;i++){
    console.log('hi');
    str = str +this.state.coord[this.state.sorted[i]].latitude+','+this.state.coord[this.state.sorted[i]].longitude+'/';
  };
  console.log(str);

  let url=await 'https://www.google.com/maps/dir'+str;
  console.log(url);
  Linking.openURL(url);

}

    min(a,b){
      if(a>b)
      return b
      else {
        return a
      }
    }
    In(i){
      this.setState(
      state=>{
       const  coord=[...state.coord, {latitude:state.markers[i-1].latlng.latitude,longitude:state.markers[i-1].latlng.longitude}];

      return {
          coord
      };
    })

    }


    async compute(g,p,start,set,n,npow,z){
      let masked,mask,result=INT_MAX,temp;
      if(g[start][set]!=-1)
        return g[start][set];
        else{
      for(let i=0;i<n;i++){
        mask=await (npow-1)-(1<<i);
        masked=await set&mask;
        if(masked!=set){
          temp=this.state.og[start][i]+await this.compute(g,p,i,masked,n,npow,z);
          if(await temp<result){
            result=await temp;
            p[start][set]=await i;

          }
        }
      }}
      return g[start][set]=result;
    }

    async getpath(g,p,start,set,n,npow,z){
      if(p[start][set]==-1) return;
      var x=await p[start][set];
      var a= await 1<<x;
      var mask=  npow-a-1;
      var masked= await set&mask;
      this.setState(state=>(
        state.sorted[z]=x
      ));
      z=await z+1;
      this.getpath(g,p,x,masked,n,npow,z);
    }
    async TSPAlgorithm(){
      let g=[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]],p=[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
      let n=this.state.coord.length;
      let npow=Math.pow(2,n);


      for(let i=0;i<n;i++){
        for(let j=0;j<npow;j++){
          g[i][j]=-1;
          p[i][j]=-1;
    }
        let a=this.state.og[i][0];
         g[i][0]=a;
      }
      await console.log(g);
      let result= await this.compute(g,p,0,npow-2,n,npow);
      console.log(result);
      this.setState(state=>(
        state.sorted[0]=0
      ));
      await this.getpath(g,p,0,npow-2,n,npow,1);
      this.setState({done : true});
    }



  addMarker(coordinate){
    this.setState(
      state=>{
       const  markers=[...state.markers, {latlng:coordinate}];

      return {
          markers
      };
    }
    );

  }
  async main(){
    await  this.loop();
    console.log(this.state.coord);


    await   this.loop2();
    console.log(this.state.og);
    while(1) {
      // console.log(this.state.sorted.length);
      // console.log(this.state.coord.length);
      if(this.state.flag) {
        this.setState({flag : true});
        await  this.TSPAlgorithm();
        break;
      }
    }

      // this.final()
  }
  async main2(){


    while(1) {
      console.log(this.state.sorted.length);
      console.log(this.state.coord.length);
      if(this.state.done) {
        this.setState({done : true});
          console.log(this.state.sorted);
        this.final();
        break;
      }
    }
  }
  componentDidMount() {
    this.watchID = navigator.geolocation.watchPosition((position) => {
      // Create the object to update this.state.mapRegion through the onRegionChange function
      let region = {
        latitude:       position.coords.latitude,
        longitude:      position.coords.longitude,
        latitudeDelta:  0.00922*1.5,
        longitudeDelta: 0.00421*1.5
      }
      this.onRegionChange(region, region.latitude, region.longitude);

    });
  }
  ShowAlertWithDelay=()=>{

      setTimeout(function(){

        //Put All Your Code Here, Which You Want To Execute After Some Delay Time.
        // alert("Press button E for navigation")
        this.setState({toggle:true, Alert_Visibility:false})


      }.bind(this), 10000);


    }
    onChanged(text){
        let newText = '';
        let numbers = '0123456789';

        for (var i=0; i < text.length; i++) {
            if(numbers.indexOf(text[i]) > -1 ) {
                newText = newText + text[i];
            }
            else {
                // your call back function
                alert("please enter numbers only");
            }
        }
        this.setState({ weight: newText });
    }
  onRegionChange(region, lastLat, lastLong) {
    this.setState({
      mapRegion: region,
      // If there are no new values set use the the current ones
      lastLat: lastLat || this.state.lastLat,
      lastLong: lastLong || this.state.lastLong
    });
    // this.map.animateToRegion(region,100);
  }
  Show_Custom_Alert(visible) {

   this.setState({Alert_Visibility: visible});

 }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }
  ok_Button=()=>{

    Alert.alert("OK Button Clicked.");

  }

  render() {
    return (
      <View style={{flex:1}}>
      {!this.state.view_toggle && !this.state.view2_toggle && <View style={styles.container2}>
      <Image source={require('./ic_launcher_round.png')} style={{marginTop:75}}/>
        <Text style={styles.welcome}>E-Narad</Text>
        <TouchableOpacity onPress={ () => {this.setState({view_toggle:true} )}}>
        <View style={{padding:20,margin:10,backgroundColor:'#0D4F8B',borderRadius:10 ,width:150,height:50,alignItems:'center',justifyContent:'center'}}><Text style={{color:'white'}}> Go To Map </Text></View></TouchableOpacity>
        <TouchableOpacity onPress={ () => {this.setState({view2_toggle:true} )}}>
        <View style={{padding:20,margin:10,backgroundColor:'#0D4F8B',borderRadius:10,width:150,height:50,alignItems:'center',justifyContent:'center'}}><Text style={{color:'white'}}> Help </Text></View></TouchableOpacity>
      </View>
      }
      {this.state.view2_toggle && <View style={styles.container2}>
      <Text style={{fontSize: 50,
      textAlign: 'center',
      margin: 20,}}>Instuctions to use</Text>
      <View style={{marginTop:30 , margin:10}}>
            {
                     this.state.names.map((item, index) => (
                           <Text style={{margin:10}}>
                              {item.name}
                           </Text>
                     ))
                  }
  </View>
  <TouchableOpacity onPress={ () => {this.setState({view_toggle:true, view2_toggle:false} )}}>
  <View style={{padding:20,margin:10,backgroundColor:'#0D4F8B',borderRadius:10 ,width:150,height:50,alignItems:'center',justifyContent:'center'}}><Text style={{color:'white'}}> Go To Map </Text></View></TouchableOpacity>
  </View>
      }

{this.state.view_toggle&& <View  style={{
  flex:1
}}>
      <View style={{
        flex:1
      }}>

        <MapView
          style={[StyleSheet.absoluteFillObject,{flex :1}]}
          region={this.state.mapRegion}
           onPress={(e) =>
             { if(this.state.markers.length<=7){
               this.addMarker(e.nativeEvent.coordinate);}
               else{
                 alert('Maximum limit reached');
               }
              }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          zoomEnable={true}
          scrollEnabled={true}
          followUserLocation={true}
           onRegionChange={()=>this.onRegionChange()}
        >
        <Polyline
		coordinates={this.state.coord}
		strokeColor="#33AFFF" // fallback for when `strokeColors` is not supported by the map-provider
		strokeWidth={6}
	/>
        <Marker
          coordinate={{
              latitude: (this.state.lastLat+0.00050) || -36.82339 ,
              longitude: (this.state.lastLon+ 0.00050) || -73.03569,
            }}/>


            {
    this.state.markers.map((markers, i) => (
      <Marker key={i} coordinate={markers.latlng}
           title={markers.latlng.latitude+', '+markers.latlng.longitude}/>
    ))
  }



        </MapView>





          <ActionButton buttonColor="#325C74" renderIcon={()=> <Icon  name='ios-arrow-dropup' color="white" size={70}/>}>
          <ActionButton.Item buttonColor='#9370DB' title="Back" onPress={()=>{
            this.setState({toggle:false,view_toggle:false})}}><Icon name="ios-arrow-back" style={styles.actionButtonIcon} />
        </ActionButton.Item>

      <ActionButton.Item buttonColor='#1abc9c' title="Clear" onPress={()=>{
        this.clear();
        this.setState({toggle:false})
 }}>
      <FontAwesome5 name="broom" style={styles.actionButtonIcon} />
      </ActionButton.Item>
      {!this.state.toggle && <ActionButton.Item buttonColor='#3498db' title="Done" onPress={()=>{
          this.main();
          !this.state.toggle&& this.Show_Custom_Alert(true);
          this.ShowAlertWithDelay();
        }}>
      <Icon name="md-done-all" style={styles.actionButtonIcon} />
      </ActionButton.Item>}
      {this.state.toggle && <ActionButton.Item buttonColor='#3498db' title="Start Navigation" onPress={()=>{
          this.main2();
          this.setState({toggle:false})
        }}>
      <MaterialIcons name="navigation" style={styles.actionButtonIcon} />
      </ActionButton.Item>}
      <ActionButton.Item buttonColor='rgba(231,76,60,1)' title="My Location"onPress={() => {
        console.log('hi');


        let region ={
          latitude:       this.state.lastLat,
          longitude:      this.state.lastLong,
          latitudeDelta:  0.00922*0.4,
          longitudeDelta: 0.00421*0.4
        }
        this.onRegionChange(region, region.latitude, region.longitude);
      }}>
      <MaterialIcons name="my-location" style={styles.actionButtonIcon} />
      </ActionButton.Item>

      </ActionButton>
  </View>
  <Modal

          visible={this.state.Alert_Visibility}

          transparent={false}

          animationType={"fade"}

          onRequestClose={ () => { this.Show_Custom_Alert(!this.state.Alert_Visibility)} } >
          <View style={{ flex:1, alignItems: 'center', justifyContent: 'center' }}>

          {!this.state.toggle &&<View style={styles.Alert_Main_View}>

          <Text style={styles.Alert_Title}>Loading....</Text>

          <View style={{ width: '100%', height: 2, backgroundColor: '#fff'}} />

          <Text style={styles.Alert_Message}>Wait few seconds</Text>

        </View>}

          </View>

        </Modal>



  </View>}
  </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position:'absolute',
    top:0,
    left:0,
    right:0,
    bottom:0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  container2: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  welcome: {
    fontSize: 50,
    textAlign: 'center',
    margin: 20,
    color:'#FF4500',

  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  map: {
    position:'absolute',
    flex:1,
    top:0,
    left:0,
    right:0,
    bottom:0,
  },
  actionButtonIcon: {
   fontSize: 20,
   height: 22,
   color: 'white',
 },
 Alert_Main_View:{

  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor : "#009688",
  height: 200 ,
  width: '90%',
  borderWidth: 1,
  borderColor: '#fff',
  borderRadius:7,

},

Alert_Title:{

  fontSize: 25,
  color: "#fff",
  textAlign: 'center',
  padding: 10,
  height: '28%'

},

Alert_Message:{

    fontSize: 22,
    color: "#fff",
    textAlign: 'center',
    padding: 10,
    height: '42%'

  },

buttonStyle: {

    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'

},

TextStyle:{
    color:'#fff',
    textAlign:'center',
    fontSize: 22,
    marginTop: -5
}
});
