import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {PrimaryButton} from '../components/PrimaryButton';
import {Screen} from '../components/Screen';
import {useAppStore} from '../store/useAppStore';
import {colors, typography} from '../theme';
import {formatRelative} from '../utils/format';

export function DocumentsScreen() {
  const navigation = useNavigation();
  const [question, setQuestion] = useState('');
  const documents = useAppStore((state) => state.documents);
  const ragLoading = useAppStore((state) => state.ragLoading);
  const chatLoading = useAppStore((state) => state.chatLoading);
  const ingestPickedDocument = useAppStore((state) => state.ingestPickedDocument);
  const removeDocument = useAppStore((state) => state.removeDocument);
  const askWithRag = useAppStore((state) => state.askWithRag);
  const notice = useAppStore((state) => state.notice);
  const globalError = useAppStore((state) => state.globalError);

  const ask = async () => {
    if (!question.trim()) {
      return;
    }
    await askWithRag(question.trim());
    setQuestion('');
    navigation.navigate('Chat');
  };

  return (
    <Screen scroll>
      <SafeAreaView edges={['top']}>
        <Text style={styles.kicker}>Library</Text>
        <Text style={styles.title}>Documents</Text>
        <Text style={styles.body}>
          Upload a .txt or .md file, then ask a question against it.
        </Text>

        <PrimaryButton
          icon="cloud-upload-outline"
          label="Upload file"
          onPress={ingestPickedDocument}
          loading={ragLoading}
        />

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        {globalError ? <Text style={styles.error}>{globalError}</Text> : null}

        <View style={styles.askBox}>
          <Text style={styles.section}>Ask your files</Text>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="What does this document say?"
            placeholderTextColor={colors.textDim}
            style={styles.input}
            multiline
          />
          <PrimaryButton
            icon="search"
            label="Ask with RAG"
            onPress={ask}
            loading={chatLoading}
            disabled={!documents.length || !question.trim()}
          />
        </View>

        <Text style={styles.section}>Files ({documents.length})</Text>
        {documents.length === 0 ? (
          <Text style={styles.empty}>Nothing uploaded yet.</Text>
        ) : (
          documents.map((doc) => (
            <View key={doc.id} style={styles.card}>
              <View style={styles.mark}>
                <Ionicons name="document-text" size={18} color={colors.accent} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.docTitle} numberOfLines={1}>
                  {doc.title}
                </Text>
                <Text style={styles.meta}>
                  {doc.chunkCount} slices · {formatRelative(doc.createdAt)}
                </Text>
              </View>
              <Pressable
                onPress={() => removeDocument(doc.id)}
                hitSlop={8}
                accessibilityLabel="Remove file">
                <Ionicons name="trash-outline" size={18} color={colors.rose} />
              </Pressable>
            </View>
          ))
        )}
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    ...typography.caption,
    color: colors.accent,
  },
  title: {
    ...typography.display,
    fontSize: 32,
    marginTop: 2,
  },
  body: {
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 14,
  },
  notice: {
    color: colors.accent,
    marginTop: 10,
  },
  error: {
    color: colors.danger,
    marginTop: 10,
  },
  askBox: {
    marginTop: 18,
    gap: 10,
  },
  section: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
    marginTop: 8,
  },
  input: {
    minHeight: 72,
    backgroundColor: colors.bgInput,
    color: colors.text,
    borderRadius: 14,
    padding: 12,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
  empty: {
    color: colors.textDim,
    marginTop: 6,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  mark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  docTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  meta: {
    color: colors.textDim,
    marginTop: 2,
    fontSize: 12,
  },
});
