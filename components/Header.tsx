import { chakra, Image, Container, Heading, HStack, Icon, IconButton, Link, useColorMode, useColorModeValue } from '@chakra-ui/react';
import NextLink from 'next/link';
import { AiFillGithub } from 'react-icons/ai';
import { FaMoon, FaSun } from 'react-icons/fa';

export function Header() {
  const { toggleColorMode } = useColorMode();
  const SwitchIcon = useColorModeValue(FaMoon, FaSun);

  return (
    <chakra.header width="full" bg="white" borderBottomWidth="1px" borderBottomStyle="solid" borderBottomColor="gray.200" _dark={{ bg: 'gray.800', borderBottomColor: 'gray.700' }}>
      <Container maxW="container.lg" py={2}>
        <HStack justify="space-between">
          <NextLink href="/" legacyBehavior passHref>
            <Link _hover={{}}>
              <HStack>
                <Image src="/gopher-lua-playground/logo.png" alt="Logo" boxSize="36px" />
                <Heading size="md" fontWeight="normal">
                  GopherLua Playground
                </Heading>
              </HStack>
            </Link>
          </NextLink>
          <HStack color="gray.400" spacing="5">
            <IconButton size="md" fontSize="lg" aria-label="Change color mode" variant="ghost" color="current" ml={{ base: '0', md: '3' }} onClick={toggleColorMode} icon={<SwitchIcon />} />
            <Link isExternal aria-label="Go to the GitHub repository" href="https://github.com/kohkimakimoto/gopher-lua-playground" display={{ base: 'none', md: 'flex' }}>
              <Icon as={AiFillGithub} w={5} h={5} display="block" transition="color 0.2s" _hover={{ color: 'gray.600' }} />
            </Link>
          </HStack>
        </HStack>
      </Container>
    </chakra.header>
  );
}
