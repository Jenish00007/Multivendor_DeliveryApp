import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ScrollView } from 'react-native';

const { width } = Dimensions.get('window');

const CarouselSlider = ({ banners }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      const nextSlide = (activeSlide + 1) % banners.length;
      scrollViewRef.current?.scrollTo({
        x: nextSlide * (width - 32),
        animated: true
      });
      setActiveSlide(nextSlide);
    }, 2000); // Change slide every 2 seconds

    return () => clearInterval(scrollInterval);
  }, [activeSlide, banners.length]);

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const activeIndex = Math.round(offset / slideSize);
    setActiveSlide(activeIndex);
  };

  return (
    <View>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {banners?.map((slide) => {
          const imageUri = typeof slide?.image === 'string' && slide.image.trim() ? slide.image : null;
          return (
            <View key={slide.id} style={styles.slide}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} />
              ) : (
                <View style={styles.image} />
              )}
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.paginationContainer}>
        {banners?.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeSlide ? styles.activeDot : styles.inactiveDot
            ]}
          />
        ))}
        <Text style={styles.paginationText}>
          {`${activeSlide + 1}/${banners.length}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    width: width - 60,
    marginHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 10,
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFD700',
  },
  inactiveDot: {
    backgroundColor: '#D3D3D3',
  },
  paginationText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
});

export default CarouselSlider;
