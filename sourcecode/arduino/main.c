/* cSpell:disable */
#define __AVR_ATmega328P__

#define FOSC 16000000UL // Clock Speed
#define BAUD 250000		// Desired BAUD
#define MYUBRR FOSC / 16 / BAUD - 1

#include <avr/interrupt.h>
#include <avr/io.h>		// Contains all the I/O Register Macros
#include <util/delay.h> // Generates a Blocking Delay
#include "serialCom.h"	// for communication with laptop
#include "i2c.h"		// for communication with MPU6050

void USART_Init(unsigned int ubrr)
{
	// For some reason, this function needs to be in main.c and cannot be in serial.c instead
	UBRR0H = (unsigned char)(ubrr >> 8);
	UBRR0L = (unsigned char)ubrr;
	// Enable receiver and transmitter
	UCSR0B = (1 << RXEN0) | (1 << TXEN0);
	// Set frame format: 8data, 2stop bit
	UCSR0C = (1 << USBS0) | (3 << UCSZ00);
}

static inline void I2C_init(void)
{

	// For some reason, this function needs to be in main.c and cannot be in i2c.c instead
	TWSR = 0;  // no prescaler
	TWBR = 72; // set clock to 100kHz
}

// address of the MPU Sensor
uint8_t address = MPU_6050;

// indicates whether gyroscope data is available (1) or not (0)
volatile short dataReadyMPU = 0;
// indicates whether ultrasonic measurement is available (1) or not (0)
volatile short dataReadyUS = 0;
// timestamp when echo goes low
volatile uint16_t dataUS;
// timestamp when echo goes high
volatile uint16_t dataUSPre;

// buffer for reading values from MPU
uint8_t data[2];

int __attribute__((OS_main)) main(void)
{
	// Setup Communication
	USART_Init(MYUBRR);
	putString("\n\rDEBUG: RESET\r\n");
	I2C_init();

	// Initialize MPU
	I2C_poke(address, 107, 0); // Set sleep to false
	I2C_poke(address, 28, 0);  // set Accelerometer Range to ±2g
	I2C_poke(address, 56, 1);  // enable Interrupts
	I2C_poke(address, 25, ~0); // Set Sampling Rate

	// Setup Ports
	DDRD |= (1 << PORTD4);	// set D4 as output
	DDRD &= ~(1 << PORTD3); // set D3 as input
	DDRD &= ~(1 << PORTD2); // set D2 as input

	// Setup Interrupts
	EICRA |= 0b0111;	   // INT1 interrupt on logic level change INT0 interrupt on rising edge
	EIMSK |= (1 << INT0);  // ENABLE INT0 interrupt
	EIMSK |= (1 << INT1);  // ENABLE INT1 interrupt
	SREG |= (1 << SREG_I); // enable global interrupts

	// Setup Clock
	TCCR1B |= 0b010; // setup clock, use 8 prescaler

	// Trigger Ultrasonic measurement for the first time
	trigger();

	while (1)
	{
		if (dataReadyMPU)
		{
			// Data from the MPU is ready > read it from sensor and send to laptop
			putString("G: ");
			I2C_read_registers(address, 67, data, 2);
			putDec((data[0] << 8) | data[1]);
			putString("\r\n");
			dataReadyMPU = 0;
		}
		if (dataReadyUS)
		{
			// Data from Ultrasonic sensor is ready > send it to laptop
			putString("U: ");
			if (dataUSPre < dataUS)
			{
				// No overflow => send difference
				putDec(dataUS - dataUSPre);
			}
			else
			{
				// Overflow has happened, correct for it
				putDec(((1 << 16) - dataUSPre) + dataUS);
			}
			putString("\r\n");
			dataReadyUS = 0;
			trigger(); // immediatly trigger new measurement
		}
	}
	return 0;
}

ISR(INT0_vect)
{
	// Interrupt from MPU received
	dataReadyMPU = 1;
}

short justOverflowed = 0;
void trigger()
{
	// trigger new ultrasonic measurement
	PORTD |= (1 << PORTD4);
	_delay_us(15);
	PORTD &= ~(1 << PORTD4);
	justOverflowed = 1;
}
ISR(INT1_vect)
{
	if (justOverflowed)
	{ // echo went high, save clock value
		dataUSPre = TCNT1;
		justOverflowed = 0;
	}
	else
	{ // echo went low, save clock value again, data is now ready to be sent
		dataUS = TCNT1;
		dataReadyUS = 1;
	}
}