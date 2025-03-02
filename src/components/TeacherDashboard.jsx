'use client'

import React from 'react'
import {
    Button,
    Box,
    CloseButton,
    Flex,
    useColorModeValue,
    Text,
    Drawer,
    DrawerContent,
    useDisclosure,
} from '@chakra-ui/react'

const LinkItems = [
    { name: 'Dashboard' },
    { name: 'Create Quiz' },
    { name: 'Manage Quizzes' },
    { name: 'View Results' },
    { name: 'Settings' },
]

export default function TeacherDashboard() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (
        <Flex direction="row" minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
            <SidebarContent
                onClose={() => onClose}
                display={{ base: 'none', md: 'block' }}
            />
            <Drawer
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                returnFocusOnClose={false}
                onOverlayClick={onClose}
                size="full">
                <DrawerContent>
                    <SidebarContent onClose={onClose} />
                </DrawerContent>
            </Drawer>
            <Box flex="1" ml={{ base: 0, md: '240px' }}>
                <MobileNav display={{ base: 'flex', md: 'none' }} onOpen={onOpen} />
                <Box p="4">
                    <Text fontSize="2xl" fontWeight="bold" mb={4}>Welcome, Teacher!</Text>
                    <Text>Select an option from the sidebar to get started.</Text>
                </Box>
            </Box>
        </Flex>
    )
}

const SidebarContent = ({ onClose, ...rest }) => {
    return (
        <Box
            bg={useColorModeValue('white', 'gray.900')}
            borderRight="1px"
            borderRightColor={useColorModeValue('gray.200', 'gray.700')}
            w={{ base: 'full', md: '240px' }}
            h="100vh"
            position="fixed"
            top={0}
            left={0}
            {...rest}>
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                    BuzzQuizz
                </Text>
                <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
            </Flex>
            {LinkItems.map((link) => (
                <NavItem key={link.name}>
                    {link.name}
                </NavItem>
            ))}
        </Box>
    )
}

const NavItem = ({ children, ...rest }) => {
    return (
        <Box
            as="a"
            href="#"
            style={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}>
            <Flex
                align="center"
                p="4"
                mx="4"
                borderRadius="lg"
                role="group"
                cursor="pointer"
                _hover={{
                    bg: '#fbf49f',
                    color: 'black',
                    fontWeight: 'bold',
                }}
                {...rest}>
                {children}
            </Flex>
        </Box>
    )
}

const MobileNav = ({ onOpen, ...rest }) => {
    return (
        <Flex
            px={{ base: 4, md: 24 }}
            height="20"
            alignItems="center"
            bg={useColorModeValue('white', 'gray.900')}
            borderBottomWidth="1px"
            borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
            justifyContent="flex-start"
            {...rest}>
            <Button
                variant="outline"
                onClick={onOpen}
                aria-label="open menu"
            >
                Menu
            </Button>

            <Text fontSize="2xl" ml="8" fontFamily="monospace" fontWeight="bold">
                BuzzQuizz
            </Text>
        </Flex>
    )
}
