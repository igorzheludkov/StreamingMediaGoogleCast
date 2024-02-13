/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import GoogleCast, {
  CastButton,
  useRemoteMediaClient,
} from 'react-native-google-cast';

const widthOriginal = Dimensions.get('window').width;
const widthRequest = Math.floor(widthOriginal);
const heightOriginal = Dimensions.get('window').height;
const heightRequest = Math.floor(heightOriginal);

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [state, setState] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  const client = useRemoteMediaClient();

  const picTemplate = (index: number) =>
    `https://picsum.photos/seed/picsum${index}/${widthRequest}/${heightRequest}`;

  // generate a list of 10 images
  const data = Array.from({length: 10}, (_, index) => index).map(index => {
    return {
      id: index,
      uri: picTemplate(index),
    };
  });

  useEffect(() => {
    GoogleCast.getCastState().then(state => {
      console.log('~~~ state', state);
      setState(state?.toString() || '');
    });
    const subscription = GoogleCast.onCastStateChanged((state: string) => {
      console.log('~~~ onCastStateChanged', state);
      setState(state);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  async function handleCast() {
    console.log('~~~ test');
    try {
      GoogleCast.showCastDialog();
      setState('showCastDialog');
    } catch (error) {
      console.log(error);
      setState(JSON.stringify(error));
    }
  }

  function sendContent() {
    setState('sendContent, activeImage: ' + activeImage);
    if (client) {
      // send active picture
      client
        .loadMedia({
          mediaInfo: {
            contentUrl: data[activeImage].uri,
            metadata: {
              type: 'photo',
              title: `Image ${activeImage}`,
              images: [
                {
                  url: data[activeImage].uri,
                  width: widthRequest,
                  height: heightRequest,
                },
              ],
            },
          },
        })
        .then(() => {
          setState('sendContent, success');
        })
        .catch(error => {
          setState('sendContent, error: ' + JSON.stringify(error));
        });
    }
  }
  // calculateActiveImageIndex
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const activeIndex = Math.round(contentOffsetX / widthOriginal);
    setActiveImage(activeIndex);
  };

  return (
    <SafeAreaView>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View>
        <FlatList
          data={data}
          renderItem={({item}) => (
            <View key={item.uri}>
              <Image
                source={{uri: item.uri}}
                style={{width: widthOriginal, height: heightOriginal}}
              />
            </View>
          )}
          keyExtractor={item => item.id.toString()}
          horizontal
          pagingEnabled
          onMomentumScrollEnd={handleScroll}
          getItemLayout={(data, index) => ({
            length: widthOriginal,
            offset: widthOriginal * index,
            index,
          })}
        />
        <TouchableOpacity style={styles.absoluteButton} onPress={handleCast}>
          <CastButton />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.absoluteButtonSend}
          onPress={sendContent}>
          <Text style={{color: 'white'}}>Send Content</Text>
        </TouchableOpacity>
        <Text style={styles.absoluteText}>{state}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  absoluteButton: {
    position: 'absolute',
    bottom: 50,
    right: 50,
    zIndex: 1000,
    height: 100,
    width: 100,
    borderWidth: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'white',
  },
  absoluteButtonSend: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    zIndex: 1000,
    height: 100,
    width: 100,
    borderWidth: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'white',
  },
  absoluteText: {
    position: 'absolute',
    padding: 20,
    top: 50,
    left: 0,
    zIndex: 1000,
    height: 200,
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'white',
    color: 'white',
    fontSize: 20,
  },
});

export default App;
