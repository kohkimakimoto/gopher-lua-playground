import { chakra, Container, HStack, Link, Text, VStack } from '@chakra-ui/react';
export function Footer() {
  return (
    <chakra.footer width="full" mt={4} pb={6}>
      <Container maxW="container.lg">
        <HStack justify="center">
          <VStack>
            <Text fontSize="12px">
              <Link isExternal href="https://github.com/kohkimakimoto/gopher-lua-playground">
                GopherLua Playground
              </Link>{' '}
              - The MIT License (MIT) - Copyright (c) 2022 Kohki Makimoto.
            </Text>
            <Text fontSize="12px">
              <Link isExternal href="https://github.com/yuin/gopher-lua">
                GopherLua
              </Link>{' '}
              - The MIT License (MIT) - Copyright (c) 2015 Yusuke Inuzuka.
            </Text>
            <Text fontSize="12px">
              <Link isExternal href="https://go.dev/blog/gopher">
                Gopher Images
              </Link>{' '}
              - Creative Commons Attribution 4.0 licensed - Graphic design by Renee French.
            </Text>
            <Text fontSize="12px">
              <Link isExternal href="https://www.lua.org/images/">
                Lua Logo Images
              </Link>{' '}
              - Copyright © 1998 Lua.org. - Graphic design by Alexandre Nakonechnyj.
            </Text>
          </VStack>
        </HStack>
      </Container>
    </chakra.footer>
  );
}
