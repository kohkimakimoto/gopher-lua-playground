import { Box, Button, Container, VStack, HStack, Flex, useColorModeValue, useToast } from '@chakra-ui/react';
import Editor from '@monaco-editor/react';
import Head from 'next/head';
import { useEffect, useState, useRef } from 'react';

import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { LuaWorkerEvent } from '../lib/event';

const initialCode = `-- Run Lua code with GopherLua!

print("Hello World!")
`;

export default function Home() {
  const toast = useToast();
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const theme = useColorModeValue('vs-light', 'vs-dark');
  const [isReady, setIsReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');

  // web worker for running Lua code
  const workerRef = useRef<Worker>();
  useEffect(() => {
    workerRef.current = new Worker(new URL('../lib/lua_worker.ts', import.meta.url));
    workerRef.current.onmessage = (event: MessageEvent<LuaWorkerEvent>) => {
      if (event.data.type == 'output') {
        setOutput((prevOutput) => {
          return prevOutput + event.data.outputBuf;
        });
      } else if (event.data.type == 'success') {
        setIsRunning(false);
        toast({
          title: 'Execution completed',
          status: 'success',
          position: 'top-right',
          duration: 4000,
          isClosable: true,
        });
      } else if (event.data.type == 'error') {
        setIsRunning(false);
        toast({
          title: 'Execution completed with error',
          status: 'error',
          position: 'top-right',
          duration: 4000,
          isClosable: true,
        });
      }
    };
    setIsReady(true);
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  async function handleRun() {
    setOutput('');
    setIsRunning(true);
    workerRef.current?.postMessage(code);
  }

  function handleEditorChange(value: string | undefined) {
    setCode(value ?? '');
  }

  return (
    <div>
      <Head>
        <title>GopherLua Playground</title>
        <meta name="description" content="Run Lua code with GopherLua!" />
        <link rel="icon" href="/gopher-lua-playground/favicon.ico" />
        <meta property="og:url" content="https://kohkimakimoto.github.io/gopher-lua-playground/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="GopherLua Playground" />
        <meta property="og:description" content="Run Lua code with GopherLua!" />
        <meta property="og:site_name" content="GopherLua Playground" />
        <meta property="og:image" content="https://kohkimakimoto.github.io/gopher-lua-playground/logo.png" />
      </Head>
      <Flex flexDirection="column" h="100vh">
        <Header />
        <VStack flexGrow={1} flex={1} spacing={0}>
          <Container maxW="container.lg">
            <HStack py={4} justify="flex-end">
              <Button disabled={!isReady} isLoading={isRunning} colorScheme="blue" fontSize="xs" fontWeight="normal" size="sm" rounded={2} onClick={handleRun}>
                Run
              </Button>
            </HStack>
          </Container>
          <Container maxW="container.lg">
            <Box borderRadius={4} borderWidth={1} borderColor={borderColor} overflow="hidden" mb={2}>
              <Editor
                height="400px"
                width="100%"
                theme={theme}
                value={code}
                defaultLanguage="lua"
                onChange={handleEditorChange}
                options={{
                  scrollBeyondLastLine: false,
                  minimap: {
                    enabled: false,
                  },
                }}
              />
            </Box>
          </Container>
          <Container maxW="container.lg">
            {(() => {
              if (output != '') {
                return (
                  <Box p={2} borderRadius={4} borderWidth={1} borderColor={borderColor} bgColor="gray.100" _dark={{ bgColor: 'gray.700' }} overflow="hidden">
                    <pre>{output}</pre>
                  </Box>
                );
              }
            })()}
          </Container>
        </VStack>
        <Footer />
      </Flex>
    </div>
  );
}
