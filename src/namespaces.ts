"use client";

import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from "./primitives/accordion/index.js";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./primitives/alert-dialog/index.js";
import {
  AppBarCenter,
  AppBarEnd,
  AppBarRoot,
  AppBarStart,
  AppBarToolbar,
} from "./primitives/app-bar/index.js";
import { AspectRatioRoot } from "./primitives/aspect-ratio/index.js";
import {
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxListbox,
  ComboboxLoading,
  ComboboxPortal,
  ComboboxRoot,
} from "./primitives/combobox/index.js";
import {
  AvatarFallback,
  AvatarGroupRoot,
  AvatarImage,
  AvatarRoot,
} from "./primitives/avatar/index.js";
import { BadgeRoot } from "./primitives/badge/index.js";
import {
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbRoot,
  BreadcrumbSeparator,
} from "./primitives/breadcrumb/index.js";
import {
  BottomNavigationItem,
  BottomNavigationRoot,
} from "./primitives/bottom-navigation/index.js";
import { ButtonRoot } from "./primitives/button/index.js";
import { CheckboxIndicator, CheckboxRoot } from "./primitives/checkbox/index.js";
import {
  CheckboxGroupItem,
  CheckboxGroupRoot,
} from "./primitives/checkbox-group/index.js";
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from "./primitives/collapsible/index.js";
import {
  ContextMenuContent,
  ContextMenuRoot,
  ContextMenuTrigger,
} from "./primitives/context-menu/index.js";
import {
  DataGridBody,
  DataGridCaption,
  DataGridCell,
  DataGridColumnHeader,
  DataGridFooter,
  DataGridHeader,
  DataGridRoot,
  DataGridRow,
} from "./primitives/data-grid/index.js";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./primitives/dialog/index.js";
import { DividerRoot } from "./primitives/divider/index.js";
import { DirectionProvider } from "./primitives/direction/index.js";
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "./primitives/drawer/index.js";
import { DropdownMenuTrigger } from "./primitives/dropdown-menu/index.js";
import {
  HoverCardArrow,
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger,
} from "./primitives/hover-card/index.js";
import {
  InputClear,
  InputRoot,
} from "./primitives/input/index.js";
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRequiredIndicator,
  FieldRoot,
} from "./primitives/field/index.js";
import {
  FieldsetDescription,
  FieldsetError,
  FieldsetLegend,
  FieldsetRoot,
} from "./primitives/fieldset/index.js";
import {
  FeedItem,
  FeedRoot,
} from "./primitives/feed/index.js";
import {
  FileUploadDropzone,
  FileUploadHiddenInput,
  FileUploadItem,
  FileUploadItemDeleteTrigger,
  FileUploadItemGroup,
  FileUploadItemName,
  FileUploadItemSize,
  FileUploadRoot,
  FileUploadTrigger,
} from "./primitives/file-upload/index.js";
import { FormRoot } from "./primitives/form/index.js";
import { LabelRoot } from "./primitives/label/index.js";
import {
  ListItem,
  ListRoot,
} from "./primitives/list/index.js";
import {
  ListboxGroup,
  ListboxLabel,
  ListboxOption,
  ListboxOptionText,
  ListboxRoot,
} from "./primitives/listbox/index.js";
import {
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuRoot,
  MenuSeparator,
  MenuSubContent,
  MenuSubRoot,
  MenuSubTrigger,
} from "./primitives/menu/index.js";
import {
  MenubarContent,
  MenubarMenu,
  MenubarRoot,
  MenubarTrigger,
} from "./primitives/menubar/index.js";
import {
  ModalBranch,
  ModalClose,
  ModalDescription,
  ModalPortal,
  ModalRoot,
  ModalTitle,
  ModalTrigger,
} from "./primitives/modal/index.js";
import {
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRoot,
  NavigationMenuSub,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "./primitives/navigation-menu/index.js";
import {
  NavListItem,
  NavListLink,
  NavListList,
  NavListRoot,
  NavListSection,
  NavListSectionContent,
  NavListSectionLabel,
  NavListSectionTrigger,
} from "./primitives/nav-list/index.js";
import { NumberInputRoot } from "./primitives/number-input/index.js";
import {
  OTPFieldInput,
  OTPFieldRoot,
  OTPFieldSeparator,
} from "./primitives/otp-field/index.js";
import {
  PasswordToggleFieldIcon,
  PasswordToggleFieldInput,
  PasswordToggleFieldRoot,
  PasswordToggleFieldToggle,
} from "./primitives/password-toggle-field/index.js";
import {
  PaginationEllipsis,
  PaginationItem,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
  PaginationRoot,
} from "./primitives/pagination/index.js";
import {
  PopoverAnchor,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from "./primitives/popover/index.js";
import { PressableRoot } from "./primitives/pressable/index.js";
import {
  ProgressIndicator,
  ProgressRoot,
} from "./primitives/progress/index.js";
import { RadioGroupRoot, RadioRoot } from "./primitives/radio-group/index.js";
import {
  RatingItem,
  RatingRoot,
} from "./primitives/rating/index.js";
import {
  ScrollAreaRoot,
  ScrollAreaViewport,
} from "./primitives/scroll-area/index.js";
import {
  SkipLinkRoot,
  SkipLinkTarget,
} from "./primitives/skip-link/index.js";
import {
  SelectArrow,
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectListbox,
  SelectPortal,
  SelectRoot,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "./primitives/select/index.js";
import {
  SidebarMain,
  SidebarPanel,
  SidebarRoot,
  SidebarTrigger,
} from "./primitives/sidebar/index.js";
import {
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
} from "./primitives/slider/index.js";
import { SwitchRoot, SwitchThumb } from "./primitives/switch/index.js";
import {
  SwipeableItemActions,
  SwipeableItemContent,
  SwipeableItemRoot,
} from "./primitives/swipeable-item/index.js";
import {
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "./primitives/tabs/index.js";
import {
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "./primitives/table/index.js";
import {
  TreeGroup,
  TreeItem,
  TreeItemText,
  TreeRoot,
} from "./primitives/tree/index.js";
import {
  TreeGridBody,
  TreeGridCaption,
  TreeGridCell,
  TreeGridColumnHeader,
  TreeGridFooter,
  TreeGridHeader,
  TreeGridRoot,
  TreeGridRow,
  TreeGridRowHeader,
} from "./primitives/tree-grid/index.js";
import {
  TextareaCount,
  TextareaRoot,
} from "./primitives/textarea/index.js";
import { ToggleRoot } from "./primitives/toggle/index.js";
import {
  ToggleGroupItemRoot,
  ToggleGroupRoot,
} from "./primitives/toggle-group/index.js";
import {
  ToolbarButton,
  ToolbarLink,
  ToolbarRoot,
  ToolbarSeparator,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from "./primitives/toolbar/index.js";
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "./primitives/tooltip/index.js";
import {
  ToastAction,
  ToastCancel,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
} from "./primitives/toast/index.js";
import { VisuallyHiddenRoot } from "./primitives/visually-hidden/index.js";

export const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Header: AccordionHeader,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
} as const;

export const AlertDialog = {
  Root: AlertDialogRoot,
  Trigger: AlertDialogTrigger,
  Portal: AlertDialogPortal,
  Overlay: AlertDialogOverlay,
  Content: AlertDialogContent,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Cancel: AlertDialogCancel,
  Action: AlertDialogAction,
} as const;

export const AppBar = {
  Root: AppBarRoot,
  Toolbar: AppBarToolbar,
  Start: AppBarStart,
  Center: AppBarCenter,
  End: AppBarEnd,
} as const;

export const AspectRatio = {
  Root: AspectRatioRoot,
} as const;

export const Combobox = {
  Root: ComboboxRoot,
  Input: ComboboxInput,
  Clear: ComboboxClear,
  Portal: ComboboxPortal,
  Content: ComboboxContent,
  Listbox: ComboboxListbox,
  Group: ComboboxGroup,
  Label: ComboboxLabel,
  Item: ComboboxItem,
  Empty: ComboboxEmpty,
  Loading: ComboboxLoading,
} as const;

export const Avatar = {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
  Group: AvatarGroupRoot,
} as const;

export const Badge = {
  Root: BadgeRoot,
} as const;

export const Breadcrumb = {
  Root: BreadcrumbRoot,
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Page: BreadcrumbPage,
  Separator: BreadcrumbSeparator,
  Ellipsis: BreadcrumbEllipsis,
} as const;

export const BottomNavigation = {
  Root: BottomNavigationRoot,
  Item: BottomNavigationItem,
} as const;

export const Button = {
  Root: ButtonRoot,
} as const;

export const Checkbox = {
  Root: CheckboxRoot,
  Indicator: CheckboxIndicator,
} as const;

export const CheckboxGroup = {
  Root: CheckboxGroupRoot,
  Item: CheckboxGroupItem,
} as const;

export const Collapsible = {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
} as const;

export const ContextMenu = {
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Group: MenuGroup,
  Separator: MenuSeparator,
  Sub: MenuSubRoot,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
} as const;

export const DataGrid = {
  Root: DataGridRoot,
  Header: DataGridHeader,
  Body: DataGridBody,
  Footer: DataGridFooter,
  Row: DataGridRow,
  ColumnHeader: DataGridColumnHeader,
  Cell: DataGridCell,
  Caption: DataGridCaption,
} as const;

export const Dialog = {
  Root: ModalRoot,
  Trigger: DialogTrigger,
  Portal: DialogPortal,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
} as const;

export const Divider = {
  Root: DividerRoot,
} as const;

export const Direction = {
  Provider: DirectionProvider,
} as const;

export const Drawer = {
  Root: ModalRoot,
  Trigger: DrawerTrigger,
  Portal: DrawerPortal,
  Overlay: DrawerOverlay,
  Content: DrawerContent,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Close: DrawerClose,
} as const;

export const DropdownMenu = {
  Root: MenuRoot,
  Trigger: DropdownMenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Group: MenuGroup,
  Separator: MenuSeparator,
  Sub: MenuSubRoot,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
} as const;

export const HoverCard = {
  Root: HoverCardRoot,
  Trigger: HoverCardTrigger,
  Portal: HoverCardPortal,
  Content: HoverCardContent,
  Arrow: HoverCardArrow,
} as const;

export const Input = {
  Root: InputRoot,
  Clear: InputClear,
} as const;

export const Field = {
  Root: FieldRoot,
  Label: FieldLabel,
  Description: FieldDescription,
  Error: FieldError,
  RequiredIndicator: FieldRequiredIndicator,
} as const;

export const Fieldset = {
  Root: FieldsetRoot,
  Legend: FieldsetLegend,
  Description: FieldsetDescription,
  Error: FieldsetError,
} as const;

export const Feed = {
  Root: FeedRoot,
  Item: FeedItem,
} as const;

export const FileUpload = {
  Root: FileUploadRoot,
  HiddenInput: FileUploadHiddenInput,
  Trigger: FileUploadTrigger,
  Dropzone: FileUploadDropzone,
  ItemGroup: FileUploadItemGroup,
  Item: FileUploadItem,
  ItemName: FileUploadItemName,
  ItemSize: FileUploadItemSize,
  ItemDeleteTrigger: FileUploadItemDeleteTrigger,
} as const;

export const Form = {
  Root: FormRoot,
} as const;

export const Label = {
  Root: LabelRoot,
} as const;

export const List = {
  Root: ListRoot,
  Item: ListItem,
} as const;

export const Listbox = {
  Root: ListboxRoot,
  Option: ListboxOption,
  OptionText: ListboxOptionText,
  Group: ListboxGroup,
  Label: ListboxLabel,
} as const;

export const Menu = {
  Root: MenuRoot,
  Content: MenuContent,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Group: MenuGroup,
  Separator: MenuSeparator,
  Sub: MenuSubRoot,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
} as const;

export const Menubar = {
  Root: MenubarRoot,
  Menu: MenubarMenu,
  Trigger: MenubarTrigger,
  Content: MenubarContent,
  Item: MenuItem,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Group: MenuGroup,
  Separator: MenuSeparator,
  Sub: MenuSubRoot,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
} as const;

export const Modal = {
  Root: ModalRoot,
  Trigger: ModalTrigger,
  Portal: ModalPortal,
  Branch: ModalBranch,
  Title: ModalTitle,
  Description: ModalDescription,
  Close: ModalClose,
} as const;

export const NavigationMenu = {
  Root: NavigationMenuRoot,
  Sub: NavigationMenuSub,
  List: NavigationMenuList,
  Item: NavigationMenuItem,
  Trigger: NavigationMenuTrigger,
  Content: NavigationMenuContent,
  Link: NavigationMenuLink,
  Indicator: NavigationMenuIndicator,
  Viewport: NavigationMenuViewport,
} as const;

export const NavList = {
  Root: NavListRoot,
  List: NavListList,
  Item: NavListItem,
  Link: NavListLink,
  Section: NavListSection,
  SectionLabel: NavListSectionLabel,
  SectionTrigger: NavListSectionTrigger,
  SectionContent: NavListSectionContent,
} as const;

export const NumberInput = {
  Root: NumberInputRoot,
} as const;

export const OTPField = {
  Root: OTPFieldRoot,
  Input: OTPFieldInput,
  Separator: OTPFieldSeparator,
} as const;

export const PasswordToggleField = {
  Root: PasswordToggleFieldRoot,
  Input: PasswordToggleFieldInput,
  Toggle: PasswordToggleFieldToggle,
  Icon: PasswordToggleFieldIcon,
} as const;

export const Pagination = {
  Root: PaginationRoot,
  List: PaginationList,
  Previous: PaginationPrevious,
  Item: PaginationItem,
  Ellipsis: PaginationEllipsis,
  Next: PaginationNext,
} as const;

export const Popover = {
  Root: PopoverRoot,
  Anchor: PopoverAnchor,
  Trigger: PopoverTrigger,
  Portal: PopoverPortal,
  Content: PopoverContent,
  Arrow: PopoverArrow,
  Close: PopoverClose,
} as const;

export const Pressable = {
  Root: PressableRoot,
} as const;

export const Progress = {
  Root: ProgressRoot,
  Indicator: ProgressIndicator,
} as const;

export const Toast = {
  Provider: ToastProvider,
  Root: ToastRoot,
  Title: ToastTitle,
  Description: ToastDescription,
  Action: ToastAction,
  Cancel: ToastCancel,
  Close: ToastClose,
  Viewport: ToastViewport,
} as const;

export const RadioGroup = {
  Root: RadioGroupRoot,
  Radio: RadioRoot,
} as const;

export const Rating = {
  Root: RatingRoot,
  Item: RatingItem,
} as const;

export const ScrollArea = {
  Root: ScrollAreaRoot,
  Viewport: ScrollAreaViewport,
} as const;

export const SkipLink = {
  Root: SkipLinkRoot,
  Target: SkipLinkTarget,
} as const;

export const Select = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Icon: SelectIcon,
  Portal: SelectPortal,
  Content: SelectContent,
  Viewport: SelectViewport,
  ScrollUpButton: SelectScrollUpButton,
  ScrollDownButton: SelectScrollDownButton,
  Listbox: SelectListbox,
  Item: SelectItem,
  ItemText: SelectItemText,
  ItemIndicator: SelectItemIndicator,
  Group: SelectGroup,
  Label: SelectLabel,
  Separator: SelectSeparator,
  Arrow: SelectArrow,
} as const;

export const Sidebar = {
  Root: SidebarRoot,
  Trigger: SidebarTrigger,
  Panel: SidebarPanel,
  Main: SidebarMain,
} as const;

export const Slider = {
  Root: SliderRoot,
  Track: SliderTrack,
  Range: SliderRange,
  Thumb: SliderThumb,
} as const;

export const Switch = {
  Root: SwitchRoot,
  Thumb: SwitchThumb,
} as const;

export const SwipeableItem = {
  Root: SwipeableItemRoot,
  Content: SwipeableItemContent,
  Actions: SwipeableItemActions,
} as const;

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
  Indicator: TabsIndicator,
} as const;

export const Table = {
  Root: TableRoot,
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
  Caption: TableCaption,
} as const;

export const Tree = {
  Root: TreeRoot,
  Item: TreeItem,
  ItemText: TreeItemText,
  Group: TreeGroup,
} as const;

export const TreeGrid = {
  Root: TreeGridRoot,
  Header: TreeGridHeader,
  Body: TreeGridBody,
  Footer: TreeGridFooter,
  Row: TreeGridRow,
  ColumnHeader: TreeGridColumnHeader,
  RowHeader: TreeGridRowHeader,
  Cell: TreeGridCell,
  Caption: TreeGridCaption,
} as const;

export const Textarea = {
  Root: TextareaRoot,
  Count: TextareaCount,
} as const;

export const Toggle = {
  Root: ToggleRoot,
} as const;

export const ToggleGroup = {
  Root: ToggleGroupRoot,
  Item: ToggleGroupItemRoot,
} as const;

export const Toolbar = {
  Root: ToolbarRoot,
  Button: ToolbarButton,
  Link: ToolbarLink,
  Separator: ToolbarSeparator,
  ToggleGroup: ToolbarToggleGroup,
  ToggleItem: ToolbarToggleItem,
} as const;

export const Tooltip = {
  Provider: TooltipProvider,
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Portal: TooltipPortal,
  Content: TooltipContent,
  Arrow: TooltipArrow,
} as const;

export const VisuallyHidden = {
  Root: VisuallyHiddenRoot,
} as const;
