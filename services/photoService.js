import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { File, Directory, Paths } from 'expo-file-system';

export const MAX_PHOTOS_PER_QUESTION = 3;

// Fotos são reduzidas para no máximo 1024px de largura em JPEG com compressão,
// o que mantém cada uma em torno de algumas centenas de KB
const MAX_WIDTH = 1024;
const JPEG_QUALITY = 0.6;
const AVATAR_WIDTH = 400;

const getPhotosDirectory = () => {
    const directory = new Directory(Paths.document, 'photos');
    if (!directory.exists) {
        directory.create({ intermediates: true, idempotent: true });
    }
    return directory;
};

const PhotoService = {
    // Abre a câmera ou a galeria e devolve a URI da foto já reduzida (ou null se cancelou)
    // square: recorte quadrado e imagem menor, usado na foto do avatar
    async pick(source, { square = false } = {}) {
        const permission =
            source === 'camera'
                ? await ImagePicker.requestCameraPermissionsAsync()
                : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert(
                'Permissão necessária',
                source === 'camera'
                    ? 'Permita o acesso à câmera para tirar fotos.'
                    : 'Permita o acesso às fotos para anexar imagens.'
            );
            return null;
        }

        const options = {
            mediaTypes: ['images'],
            quality: 1,
            ...(square ? { allowsEditing: true, aspect: [1, 1] } : {}),
        };
        const result =
            source === 'camera'
                ? await ImagePicker.launchCameraAsync(options)
                : await ImagePicker.launchImageLibraryAsync(options);

        if (result.canceled || !result.assets?.length) return null;

        const asset = result.assets[0];
        const maxWidth = square ? AVATAR_WIDTH : MAX_WIDTH;
        const actions = asset.width > maxWidth ? [{ resize: { width: maxWidth } }] : [];
        const resized = await ImageManipulator.manipulateAsync(asset.uri, actions, {
            compress: JPEG_QUALITY,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
        });

        const file = new File(getPhotosDirectory(), `${square ? 'avatar' : 'photo'}-${Date.now()}-${Math.round(Math.random() * 1e6)}.jpg`);
        file.create({ overwrite: true });
        file.write(resized.base64, { encoding: 'base64' });
        return file.uri;
    },

    async toBase64(uri) {
        try {
            return await new File(uri).base64();
        } catch (error) {
            console.error('Erro ao ler foto:', error);
            return null;
        }
    },

    remove(uris = []) {
        uris.forEach((uri) => {
            try {
                const file = new File(uri);
                if (file.exists) file.delete();
            } catch (error) {
                console.error('Erro ao apagar foto:', error);
            }
        });
    },
};

export default PhotoService;
