import { StyleSheet, Dimensions } from 'react-native';
import { scale } from '../../utils/scaling';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    scrollView: {
        flex: 1
    },
    imageContainer: {
        width: '100%',
        height: width,
        position: 'relative'
    },
    productImage: {
        width: width,
        height: width,
        resizeMode: 'cover'
    },
    dotContainer: {
        position: 'absolute',
        bottom: scale(20),
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%'
    },
    dot: {
        width: scale(8),
        height: scale(8),
        borderRadius: scale(4),
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: scale(4)
    },
    activeDot: {
        backgroundColor: '#fff'
    },
    favIconContainer: {
        position: 'absolute',
        top: scale(20),
        right: scale(20),
        zIndex: 1
    },
    infoSection: {
        padding: scale(20),
        borderTopLeftRadius: scale(20),
        borderTopRightRadius: scale(20),
        marginTop: -scale(20)
    },
    nameAndPrice: {
        marginBottom: scale(15)
    },
    productName: {
        fontSize: scale(24),
        fontWeight: 'bold',
        marginBottom: scale(10)
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10)
    },
    originalPrice: {
        fontSize: scale(16),
        textDecorationLine: 'line-through'
    },
    productPrice: {
        fontSize: scale(20),
        fontWeight: 'bold'
    },
    categoryContainer: {
        marginBottom: scale(15)
    },
    categoryText: {
        fontSize: scale(14)
    },
    ratingStockContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scale(15)
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(5)
    },
    starsContainer: {
        flexDirection: 'row',
        gap: scale(2)
    },
    ratingText: {
        fontSize: scale(14)
    },
    stockBadge: {
        paddingHorizontal: scale(10),
        paddingVertical: scale(5),
        borderRadius: scale(15)
    },
    stockText: {
        fontSize: scale(12),
        fontWeight: '500'
    },
    divider: {
        height: 1,
        marginVertical: scale(15)
    },
    shopContainer: {
        marginBottom: scale(15)
    },
    shopInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
        marginTop: scale(10)
    },
    shopAvatar: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(25)
    },
    shopDetails: {
        flex: 1
    },
    shopName: {
        fontSize: scale(16),
        fontWeight: '500',
        marginBottom: scale(5)
    },
    shopAddress: {
        fontSize: scale(14)
    },
    descriptionContainer: {
        marginBottom: scale(15)
    },
    sectionTitle: {
        fontSize: scale(18),
        fontWeight: '600',
        marginBottom: scale(10)
    },
    productDescription: {
        fontSize: scale(14),
        lineHeight: scale(20)
    },
    tagsContainer: {
        marginBottom: scale(15)
    },
    tagsText: {
        fontSize: scale(14),
        lineHeight: scale(20)
    },
    bottomActions: {
        flexDirection: 'row',
        padding: scale(15),
        gap: scale(10),
        borderTopWidth: 1,
        borderTopColor: '#eee'
    },
    cartButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: scale(15),
        borderRadius: scale(10),
        gap: scale(10)
    },
    addButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: scale(15),
        borderRadius: scale(10),
        gap: scale(10)
    },
    buttonText: {
        color: '#fff',
        fontSize: scale(16),
        fontWeight: '500'
    }
});

export default styles;