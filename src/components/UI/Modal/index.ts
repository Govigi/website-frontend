import ModalRoot from "./Modal";
import ModalContent from "./ModalContent";

import {
    Header,
    Title,
    Description,
    Body,
    Footer
} from "./ModalParts";

export const Modal = Object.assign(
    ModalRoot,
    {
        Content: ModalContent,
        Header,
        Title,
        Description,
        Body,
        Footer
    }
);