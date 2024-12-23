import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Flex,
    Grid,
    GridItem,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Textarea,
    useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function Notes() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [notes, setNotes] = useState([]);
    const [modalType, setModalType] = useState("add"); // "add" or "edit"
    const [formData, setFormData] = useState({ title: "", description: "" });
    const [selectedId, setSelectedId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const router = useRouter();

    useEffect(() => {
        // Fetch notes data
        async function fetchNotes() {
            try {
                const response = await fetch("https://service.pace-unv.cloud/api/notes");
                const data = await response.json();
                setNotes(data);
            } catch (error) {
                console.error("Error fetching notes:", error);
            }
        }
        fetchNotes();
    }, []);

    // Open modal for add/edit
    const handleOpenModal = (type, data = null) => {
        setModalType(type);
        setFormData(data || { title: "", description: "" });
        onOpen();
    };

    // Handle form submit for add/edit
    const handleSubmit = async () => {
        try {
            const url =
                modalType === "add"
                    ? "https://service.pace-unv.cloud/api/notes"
                    : `https://service.pace-unv.cloud/api/notes/update/${formData.id}`;
            const method = modalType === "add" ? "POST" : "PATCH";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (result?.success) {
                router.reload();
                onClose();
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Open delete confirmation modal
    const confirmDelete = (id) => {
        setSelectedId(id);
        setIsDeleteModalOpen(true);
    };

    // Handle delete note
    const handleDelete = async () => {
        try {
            const response = await fetch(
                `https://service.pace-unv.cloud/api/notes/delete/${selectedId}`,
                { method: "DELETE" }
            );
            const result = await response.json();
            if (result?.success) {
                router.reload();
                setIsDeleteModalOpen(false);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Box p={5}>
            {/* Add Notes Button */}
            <Flex justifyContent="end" mb={5}>
                <Button colorScheme="blue" onClick={() => handleOpenModal("add")}>
                    Add Notes
                </Button>
            </Flex>

            {/* Notes List */}
            <Grid templateColumns="repeat(3, 1fr)" gap={5}>
                {notes?.data?.map((item) => (
                    <GridItem key={item.id}>
                        <Card>
                            <CardHeader fontWeight="bold">{item.title}</CardHeader>
                            <CardBody>{item.description}</CardBody>
                            <CardFooter>
                                <Button
                                    onClick={() => handleOpenModal("edit", item)}
                                    colorScheme="teal"
                                    mr={2}
                                >
                                    Edit
                                </Button>
                                <Button
                                    onClick={() => confirmDelete(item?.id)}
                                    colorScheme="red"
                                >
                                    Delete
                                </Button>
                            </CardFooter>
                        </Card>
                    </GridItem>
                ))}
            </Grid>

            {/* Modal for Add/Edit */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        {modalType === "add" ? "Add Note" : "Edit Note"}
                    </ModalHeader>
                    <ModalBody>
                        <Input
                            placeholder="Title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            mb={4}
                        />
                        <Textarea
                            placeholder="Description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                            Save
                        </Button>
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Modal for Delete Confirmation */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Delete Confirmation</ModalHeader>
                    <ModalBody>Are you sure you want to delete this note?</ModalBody>
                    <ModalFooter>
                        <Button colorScheme="red" mr={3} onClick={handleDelete}>
                            Yes, Delete
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
