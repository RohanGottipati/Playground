import type { CatalogEntry } from '../types/game';
import { objectGroup, type ObjectRow } from './spriteEntry';
import * as F from '../components/sprites/objects/Furniture';
import * as K from '../components/sprites/objects/Kitchen';
import * as D from '../components/sprites/objects/Food';
import * as T from '../components/sprites/objects/Tech';
import * as St from '../components/sprites/objects/Stationery';
import * as Sp from '../components/sprites/objects/Sports';
import * as V from '../components/sprites/objects/Vehicles';
import * as To from '../components/sprites/objects/Tools';
import * as C from '../components/sprites/objects/Clothing';
import * as O from '../components/sprites/objects/Outdoors';
import * as Ty from '../components/sprites/objects/Toys';
import * as M from '../components/sprites/objects/Music';
import * as H from '../components/sprites/objects/Household';

const furniture: ObjectRow[] = [
[F.SofaObject, 'Sofa', 'Wide soft platform that cancels fall damage.', 'platform'],
[F.BedObject, 'Bed', 'Respawn point and gentle bounce surface.', 'checkpoint'],
[F.DeskObject, 'Desk', 'Sturdy elevated platform with a drawer cavity.', 'platform'],
[F.StoolObject, 'Stool', 'Single-tile perch for precise jumps.', 'platform'],
[F.WardrobeObject, 'Wardrobe', 'Tall solid wall that blocks the route.', 'wall'],
[F.RugObject, 'Rug', 'Trigger zone or safe landing pad.', 'trigger'],
[F.MirrorObject, 'Mirror', 'Reflects projectiles and reveals hidden paths.', 'puzzle', true],
[F.WindowObject, 'Window', 'Breakable pass-through into the next room.', 'destructible'],
[F.DoorObject, 'Door', 'Transition between level sections.', 'door'],
[F.PictureFrameObject, 'Picture frame', 'Wall dressing that can hide a switch.', 'decor'],
[F.PottedPlantObject, 'Potted plant', 'Soft cover the player can hide behind.', 'decor', true],
[F.CurtainObject, 'Curtain', 'Conceals secret rooms until brushed aside.', 'secret', true],
[F.CabinetObject, 'Filing cabinet', 'Heavy pushable block for puzzles.', 'pushable'],
[F.CeilingFanObject, 'Ceiling fan', 'Recurring updraft that lifts gliders.', 'force', true],
[F.StepLadderObject, 'Step ladder', 'Climbable vertical traversal object.', 'traversal']];


const kitchen: ObjectRow[] = [
[K.MugObject, 'Mug', 'Small stackable block.', 'block', true],
[K.KettleObject, 'Kettle', 'Emits a scalding steam jet on a timer.', 'hazard', true],
[K.ToasterObject, 'Toaster', 'Pops the player upward like a bounce pad.', 'launcher', true],
[K.FryingPanObject, 'Frying pan', 'Swingable melee object and flat platform.', 'weapon'],
[K.PotObject, 'Cooking pot', 'Container the player can hide inside.', 'container'],
[K.FridgeObject, 'Fridge', 'Tall solid block that chills the area.', 'wall'],
[K.MicrowaveObject, 'Microwave', 'Timed radiation burst hazard.', 'hazard', true],
[K.BlenderObject, 'Blender', 'Spinning blade hazard.', 'hazard', true],
[K.PlateObject, 'Plate', 'Thin floating platform.', 'platform'],
[K.ForkObject, 'Fork', 'Point-up spike hazard.', 'hazard'],
[K.KnifeObject, 'Knife', 'Sharp blade hazard or thrown weapon.', 'hazard'],
[K.RollingPinObject, 'Rolling pin', 'Rolls downhill and knocks the player back.', 'hazard', true],
[K.BottleObject, 'Bottle', 'Breakable glass object.', 'destructible'],
[K.CanObject, 'Tin can', 'Stack or roll it to reach ledges.', 'pushable'],
[K.CuttingBoardObject, 'Cutting board', 'Plank platform for narrow gaps.', 'platform'],
[K.CerealBoxObject, 'Cereal box', 'Light pushable block.', 'pushable'],
[K.SingleUseBottleObject, 'Water bottle', 'Clear single-use bottle, light enough to fall.', 'destructible', true]];


const food: ObjectRow[] = [
[D.PizzaObject, 'Pizza slice', 'Restores a chunk of health.', 'health', true],
[D.BurgerObject, 'Burger', 'Large health pickup.', 'health', true],
[D.DonutObject, 'Donut', 'Ring collectible worth bonus points.', 'collectible', true],
[D.AppleObject, 'Apple', 'Small health pickup.', 'health', true],
[D.BananaObject, 'Banana peel', 'Slip hazard that removes control briefly.', 'hazard'],
[D.WatermelonObject, 'Watermelon', 'Splits into two smaller pickups.', 'collectible', true],
[D.IceCreamObject, 'Ice cream', 'Melts on a timer — grab it fast.', 'timed', true],
[D.CupcakeObject, 'Cupcake', 'Combo reward pickup.', 'collectible', true],
[D.SushiObject, 'Sushi', 'Small stackable block.', 'block', true],
[D.TacoObject, 'Taco', 'Hinged platform that folds under weight.', 'platform'],
[D.HotDogObject, 'Hot dog', 'Long thin bridge platform.', 'platform'],
[D.CoffeeCupObject, 'Coffee cup', 'Temporary speed boost.', 'powerup', true],
[D.SodaCanObject, 'Soda can', 'Fizz-powered jump boost.', 'powerup', true],
[D.EggObject, 'Egg', 'Fragile object that cracks on impact.', 'destructible', true],
[D.CheeseObject, 'Cheese', 'Wedge platform with holes to fall through.', 'platform'],
[D.CarrotObject, 'Carrot', 'Thin pickup that doubles as a spike.', 'collectible', true],
[D.PopcornObject, 'Popcorn', 'Spawns bouncing kernels.', 'spawner', true],
[D.LollipopObject, 'Lollipop', 'Sticky surface the player clings to.', 'sticky', true]];


const tech: ObjectRow[] = [
[T.LaptopObject, 'Laptop', 'Terminal checkpoint and flat platform.', 'checkpoint', true],
[T.PhoneObject, 'Smartphone', 'Map and hint device pickup.', 'utility', true],
[T.TabletObject, 'Tablet', 'Thin sliding platform.', 'platform'],
[T.TvObject, 'Television', 'Cutscene screen and background prop.', 'decor', true],
[T.KeyboardObject, 'Keyboard', 'Long flat platform with key steps.', 'platform'],
[T.MouseObject, 'Computer mouse', 'Small pushable object.', 'pushable'],
[T.HeadphonesObject, 'Headphones', 'Mutes sound-based hazards.', 'powerup', true],
[T.SpeakerObject, 'Speaker', 'Emits sound-wave shockwaves.', 'hazard', true],
[T.ControllerObject, 'Game controller', 'Grants an extra ability slot.', 'powerup', true],
[T.CameraObject, 'Camera', 'The photo tool itself — hub object.', 'hub', true],
[T.LightBulbObject, 'Light bulb', 'Lights dark rooms when carried.', 'light', true],
[T.RouterObject, 'Router', 'Signal zone that acts as a checkpoint.', 'checkpoint', true],
[T.BoomboxObject, 'Boombox', 'Spawns rhythm-timed platforms.', 'spawner', true],
[T.DeskLampObject, 'Desk lamp', 'Directional light cone.', 'light', true],
[T.WallClockObject, 'Wall clock', 'Displays the level timer in-world.', 'timed', true],
[T.VacuumObject, 'Vacuum cleaner', 'Pulls nearby pickups toward it.', 'force', true],
[T.AirpodsCaseObject, 'Earbud case', 'Pocket container that snaps shut.', 'container', true],
[T.AirpodsCaseOpenObject, 'Earbud case open', 'Open case that launches its buds.', 'hazard', true],
[T.AirpodsObject, 'Earbuds', 'Pair of buds, small and throwable.', 'collectible', true],
[T.PhoneBouncePadObject, 'Phone bounce pad', 'Face-up phone that flings the player skyward.', 'launcher', true]];


const stationery: ObjectRow[] = [
[St.PencilObject, 'Pencil', 'Long thin platform, or a spike point-first.', 'platform'],
[St.PenObject, 'Pen', 'Thrown dart projectile.', 'weapon'],
[St.EraserObject, 'Eraser', 'Deletes the blocks it touches.', 'puzzle'],
[St.RulerObject, 'Ruler', 'Measured platform showing jump distances.', 'platform'],
[St.ScissorsObject, 'Scissors', 'Cuts ropes, vines and zip lines.', 'tool'],
[St.StaplerObject, 'Stapler', 'Clamps two platforms together.', 'puzzle'],
[St.NotebookObject, 'Notebook', 'Save point.', 'checkpoint'],
[St.BookObject, 'Book', 'Stackable block for building stairs.', 'block'],
[St.BackpackObject, 'Backpack', 'Expands carrying capacity.', 'powerup', true],
[St.CalculatorObject, 'Calculator', 'Keypad puzzle object.', 'puzzle'],
[St.PaperclipObject, 'Paperclip', 'Improvised grappling hook.', 'traversal', true],
[St.StickyNoteObject, 'Sticky note', 'Hint marker placed on walls.', 'tutorial', true],
[St.TapeRollObject, 'Tape roll', 'Creates a sticky climbable surface.', 'sticky', true],
[St.GlobeObject, 'Globe', 'World and level select object.', 'hub', true],
[St.AlarmClockObject, 'Alarm clock', 'Starts a timed challenge.', 'timed', true],
[St.WhiteboardObject, 'Whiteboard', 'Tutorial surface for instructions.', 'tutorial']];


const sports: ObjectRow[] = [
[Sp.BasketballObject, 'Basketball', 'Bouncing physics object.', 'bounce', true],
[Sp.SoccerBallObject, 'Football', 'Kickable object that triggers switches.', 'physics', true],
[Sp.TennisRacketObject, 'Tennis racket', 'Swats projectiles back at enemies.', 'weapon'],
[Sp.BaseballBatObject, 'Baseball bat', 'Melee weapon with knockback.', 'weapon'],
[Sp.SkateboardObject, 'Skateboard', 'Rideable moving platform.', 'vehicle', true],
[Sp.BicycleObject, 'Bicycle', 'Fast ground traversal.', 'vehicle', true],
[Sp.HelmetObject, 'Helmet', 'Absorbs one hit from above.', 'armour', true],
[Sp.DumbbellObject, 'Dumbbell', 'Heavy weight for pressure plates.', 'pushable'],
[Sp.JumpRopeObject, 'Jump rope', 'Swingable rope across gaps.', 'traversal', true],
[Sp.SurfboardObject, 'Surfboard', 'Floats and rides water currents.', 'vehicle', true],
[Sp.SkiObject, 'Skis', 'Slide at speed over ice.', 'vehicle'],
[Sp.HockeyStickObject, 'Hockey stick', 'Launches pucks at targets.', 'weapon'],
[Sp.BoxingGloveObject, 'Boxing glove', 'Spring-loaded punch trap.', 'hazard', true],
[Sp.FrisbeeObject, 'Frisbee', 'Returning thrown projectile.', 'weapon', true],
[Sp.BowlingBallObject, 'Bowling ball', 'Heavy rolling hazard.', 'hazard', true],
[Sp.BowlingPinObject, 'Bowling pin', 'Knockable target object.', 'target'],
[Sp.YogaMatObject, 'Yoga mat', 'Rolls out into a soft platform.', 'platform'],
[Sp.RollerSkateObject, 'Roller skate', 'Continuous speed boost.', 'powerup', true]];


const vehicles: ObjectRow[] = [
[V.CarObject, 'Car', 'Moving platform and road obstacle.', 'vehicle', true],
[V.BusObject, 'Bus', 'Long moving platform.', 'vehicle', true],
[V.TruckObject, 'Truck', 'Heavy vehicle with a rideable bed.', 'vehicle', true],
[V.TrainObject, 'Train', 'Rail-bound moving platform.', 'vehicle', true],
[V.PlaneObject, 'Aeroplane', 'Sky-level ride or backdrop.', 'vehicle', true],
[V.RocketObject, 'Rocket', 'Launches the player to the next zone.', 'launcher', true],
[V.BoatObject, 'Boat', 'Floating platform on water.', 'vehicle', true],
[V.ScooterObject, 'Scooter', 'Light rideable object.', 'vehicle', true],
[V.MotorcycleObject, 'Motorcycle', 'High-speed vehicle.', 'vehicle', true],
[V.HelicopterObject, 'Helicopter', 'Hovering ride or boss platform.', 'vehicle', true],
[V.HotAirBalloonObject, 'Hot air balloon', 'Slow vertical lift.', 'lift', true],
[V.ShoppingCartObject, 'Shopping trolley', 'Pushable container on wheels.', 'pushable'],
[V.WheelbarrowObject, 'Wheelbarrow', 'Carries objects between rooms.', 'container'],
[V.TrafficConeObject, 'Traffic cone', 'Small obstacle and route marker.', 'obstacle'],
[V.TrafficLightObject, 'Traffic light', 'Timed gate signal.', 'timed', true],
[V.TyreObject, 'Tyre', 'Bouncy rolling object.', 'bounce', true],
[V.FuelPumpObject, 'Fuel pump', 'Refuels jetpacks and vehicles.', 'refill']];


const tools: ObjectRow[] = [
[To.HammerObject, 'Hammer', 'Breaks cracked blocks.', 'tool'],
[To.ScrewdriverObject, 'Screwdriver', 'Opens sealed panels.', 'tool'],
[To.WrenchObject, 'Wrench', 'Rotates machinery and gates.', 'tool', true],
[To.SawObject, 'Handsaw', 'Cuts wooden platforms down.', 'tool'],
[To.DrillObject, 'Power drill', 'Drills through soft terrain.', 'tool', true],
[To.PaintBucketObject, 'Paint bucket', 'Repaints the level palette.', 'utility'],
[To.PaintBrushObject, 'Paint brush', 'Draws temporary platforms.', 'utility'],
[To.ToolboxObject, 'Toolbox', 'Container of upgrades.', 'container'],
[To.TapeMeasureObject, 'Tape measure', 'Shows jump distances.', 'utility'],
[To.BroomObject, 'Broom', 'Sweeps small enemies away.', 'weapon', true],
[To.BucketObject, 'Bucket', 'Carries water to extinguish fire.', 'container'],
[To.WateringCanObject, 'Watering can', 'Grows vines into ladders.', 'tool'],
[To.ShovelObject, 'Shovel', 'Digs through dirt tiles.', 'tool'],
[To.FlashlightObject, 'Flashlight', 'Lights caves in a cone.', 'light', true],
[To.RopeCoilObject, 'Rope coil', 'Deployable climbing rope.', 'traversal'],
[To.ChainObject, 'Chain', 'Links moving parts together.', 'connector', true],
[To.NailObject, 'Nail', 'Small spike hazard.', 'hazard'],
[To.PlungerObject, 'Plunger', 'Sticks to walls for climbing.', 'traversal']];


const clothing: ObjectRow[] = [
[C.TshirtObject, 'T-shirt', 'Cosmetic skin pickup.', 'cosmetic', true],
[C.CapObject, 'Cap', 'Headwear cosmetic.', 'cosmetic', true],
[C.SneakerObject, 'Trainer', 'Grip boost on slippery ground.', 'powerup', true],
[C.BootObject, 'Boot', 'Heavy stomp attack.', 'powerup'],
[C.SockObject, 'Sock', 'Light floaty throwable.', 'physics', true],
[C.GloveObject, 'Glove', 'Unlocks the grab ability.', 'powerup', true],
[C.ScarfObject, 'Scarf', 'Trailing cosmetic that aids gliding.', 'cosmetic', true],
[C.JacketObject, 'Jacket', 'Adds a layer of armour.', 'armour'],
[C.SunglassesObject, 'Sunglasses', 'Reveals hidden platforms.', 'utility', true],
[C.WatchObject, 'Wristwatch', 'Slow-motion power-up.', 'powerup', true],
[C.HangerObject, 'Coat hanger', 'Hook point for zip lines.', 'traversal', true],
[C.TopHatObject, 'Top hat', 'Collectible cosmetic.', 'cosmetic', true],
[C.BeltObject, 'Belt', 'Adds an item slot.', 'utility'],
[C.SwimRingObject, 'Swim ring', 'Keeps the player afloat.', 'utility', true],
[C.FlipFlopObject, 'Flip flop', 'Light beach prop.', 'decor']];


const outdoors: ObjectRow[] = [
[O.FlowerObject, 'Flower', 'Decorative pickup that scores points.', 'collectible', true],
[O.CactusObject, 'Cactus', 'Spiky desert hazard.', 'hazard'],
[O.LogObject, 'Log', 'Rollable platform.', 'platform'],
[O.StumpObject, 'Tree stump', 'Small step platform.', 'platform'],
[O.PuddleObject, 'Puddle', 'Slows movement through it.', 'slow', true],
[O.SnowmanObject, 'Snowman', 'Breakable winter prop.', 'destructible', true],
[O.SandcastleObject, 'Sandcastle', 'Crumbles when stood on.', 'timed'],
[O.SeashellObject, 'Seashell', 'Beach collectible.', 'collectible', true],
[O.BeachBallObject, 'Beach ball', 'Bouncy sphere physics object.', 'bounce', true],
[O.BeehiveObject, 'Beehive', 'Spawns chasing bees when hit.', 'spawner', true],
[O.FeatherObject, 'Feather', 'Slow-fall pickup.', 'powerup', true],
[O.NestObject, 'Nest', 'Fragile perch with egg pickups.', 'platform'],
[O.LightningObject, 'Lightning', 'Electric strike hazard.', 'hazard', true],
[O.RainbowObject, 'Rainbow', 'Bridge that appears after rain.', 'platform', true],
[O.AnthillObject, 'Anthill', 'Spawns small crawling enemies.', 'spawner'],
[O.MushroomClusterObject, 'Mushroom cluster', 'Natural bounce pads.', 'bounce', true]];


const toys: ObjectRow[] = [
[Ty.TeddyBearObject, 'Teddy bear', 'Companion and soft landing.', 'companion', true],
[Ty.RubberDuckObject, 'Rubber duck', 'Floats on water and squeaks.', 'float', true],
[Ty.BuildingBrickObject, 'Building brick', 'Modular stackable block.', 'block'],
[Ty.DiceObject, 'Dice', 'Randomises the active mechanic.', 'random', true],
[Ty.KiteObject, 'Kite', 'Wind-riding glider.', 'glider', true],
[Ty.YoyoObject, 'Yo-yo', 'Swing and grapple toy.', 'traversal', true],
[Ty.SpinningTopObject, 'Spinning top', 'Rotating hazard that drifts.', 'hazard', true],
[Ty.MarbleObject, 'Marble', 'Rolling physics object.', 'physics', true],
[Ty.PuzzlePieceObject, 'Puzzle piece', 'Collectible fragment to complete a set.', 'collectible', true],
[Ty.ToyCarObject, 'Toy car', 'Small self-moving object.', 'moving', true],
[Ty.PlayingCardsObject, 'Playing cards', 'Stack that collapses under weight.', 'timed'],
[Ty.BubbleWandObject, 'Bubble wand', 'Creates floating bubble platforms.', 'spawner', true],
[Ty.PinwheelObject, 'Pinwheel', 'Spins in wind zones to open gates.', 'switch', true],
[Ty.JackInBoxObject, 'Jack-in-the-box', 'Surprise launcher.', 'launcher', true],
[Ty.ActionFigureObject, 'Action figure', 'Collectible character token.', 'collectible', true]];


const music: ObjectRow[] = [
[M.GuitarObject, 'Guitar', 'String platform and swing weapon.', 'weapon', true],
[M.DrumObject, 'Drum', 'Rhythmic bounce pad.', 'bounce', true],
[M.PianoObject, 'Piano keys', 'Play the sequence to open a gate.', 'puzzle'],
[M.TrumpetObject, 'Trumpet', 'Air blast pushes the player.', 'force', true],
[M.MicrophoneObject, 'Microphone', 'Shout mechanic that stuns enemies.', 'weapon', true],
[M.VinylObject, 'Vinyl record', 'Spinning disc platform.', 'platform', true],
[M.ViolinObject, 'Violin', 'Elegant swingable object.', 'weapon'],
[M.XylophoneObject, 'Xylophone', 'Tuned row of stepped platforms.', 'platform'],
[M.MaracasObject, 'Maracas', 'Shake to stun nearby enemies.', 'weapon', true],
[M.CassetteObject, 'Cassette tape', 'Soundtrack collectible.', 'collectible', true],
[M.TambourineObject, 'Tambourine', 'Rhythmic bounce ring.', 'bounce', true],
[M.HarmonicaObject, 'Harmonica', 'Small collectible instrument.', 'collectible']];


const household: ObjectRow[] = [
[H.ToiletRollObject, 'Toilet roll', 'Rolls downhill as a soft obstacle.', 'physics', true],
[H.ToothbrushObject, 'Toothbrush', 'Tiny pickup for collection runs.', 'collectible'],
[H.SoapObject, 'Soap bar', 'Slippery low-friction surface.', 'slippery'],
[H.TowelObject, 'Towel', 'Hangs down as a climbable rope.', 'traversal', true],
[H.BathtubObject, 'Bathtub', 'Water container and boat.', 'container'],
[H.WashingMachineObject, 'Washing machine', 'Spinning drum hazard.', 'hazard', true],
[H.LaundryBasketObject, 'Laundry basket', 'Carries collected items.', 'container'],
[H.IronObject, 'Iron', 'Heavy crusher that drops from above.', 'hazard'],
[H.TrashBinObject, 'Bin', 'Hide inside to avoid enemies.', 'stealth'],
[H.CandleObject, 'Candle', 'Light source on a burn timer.', 'light', true],
[H.WalletObject, 'Wallet', 'Currency container pickup.', 'currency'],
[H.KeyRingObject, 'Key ring', 'Bundle of keys for multiple doors.', 'key', true],
[H.GiftBoxObject, 'Gift box', 'Reward container with a random item.', 'reward', true],
[H.CakeObject, 'Birthday cake', 'Big end-of-level reward.', 'reward', true],
[H.PartyBalloonsObject, 'Party balloons', 'Lifts the player upward.', 'lift', true],
[H.PartyHatObject, 'Party hat', 'Cosmetic cone pickup.', 'cosmetic', true],
[H.ExtinguisherObject, 'Fire extinguisher', 'Puts out fire hazards.', 'tool'],
[H.MailboxObject, 'Post box', 'Delivers level messages and hints.', 'tutorial'],
[H.PiggyBankObject, 'Piggy bank', 'Smash it for a coin payout.', 'currency', true]];


export const objectEntries: CatalogEntry[] = [
...objectGroup('furniture', 'fur', furniture),
...objectGroup('kitchen', 'kit', kitchen),
...objectGroup('food', 'food', food),
...objectGroup('tech', 'tech', tech),
...objectGroup('stationery', 'stat', stationery),
...objectGroup('sports', 'sport', sports),
...objectGroup('vehicles', 'veh', vehicles),
...objectGroup('tools', 'tool', tools),
...objectGroup('clothing', 'cloth', clothing),
...objectGroup('outdoors', 'out', outdoors),
...objectGroup('toys', 'toy', toys),
...objectGroup('music', 'mus', music),
...objectGroup('household', 'house', household)];
